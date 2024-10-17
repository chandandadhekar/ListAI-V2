import '../tailwind.css';  // Ensure the correct path to your tailwind.css file
import { Link } from "@remix-run/react";
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  ImageIcon,
  Menu,
  Package,
  SaveIcon,
  Search,
  StarsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { Textarea } from "@/components/ui/textarea";
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import OpenAI from "openai";

// **Temporary Hardcoded API Key** (For local development ONLY)
// Replace this with `process.env.OPENAI_API_KEY` for better security.
const openaiApiKey = "";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: openaiApiKey, 
  dangerouslyAllowBrowser: true
});


async function generateProductDescriptionFromImage(openai: OpenAI, imageUrl: string) {
  if (!imageUrl) {
    return "<p>Discover the unparalleled quality of our products. Each item is crafted with care, ensuring durability and style. Perfect for any occasion!</p>";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI that generates product descriptions based on the image analysis. Generate a compelling description focusing on quality and features. return only description not conversation, follow this instructions: You are a helpful assistant that generates product descriptions based on image analysis for SEO, marketplace posting, and customer attraction. Follow these instructions strictly:
- Always return only the product description generated from the image analysis.
- Since the user will auto-publish it to a marketplace, ensure that only the product description is returned, without any additional information.
- If no meaningful description can be extracted from the image, generate a standard product description that emphasizes quality and is suitable for any product. Do not ask for additional input.
- Enhance the product description using HTML formatting with best-in-class practices, such as proper formatting, and tables (if necessary), ensuring a professional and industry-standard presentation.
- Ensure the wording and sentences are well-structured, free from copyright infringement, and comply with marketplace guidelines.
- Ensure its proper html format as its directly going to the text editor so it should render well. so remove '''html etc starting
`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl, // Use the provided image URL
              },
            },
          ],
        },
      ],
      max_tokens: 300, // Set the max tokens for the response
    });

    // Check if a response is available and return it, or a fallback message
    return response.choices[0].message?.content || "Enhancement not available.";
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "An error occurred while generating the description. Please try again later.";
  }
}

async function generateProductDescription(openai: OpenAI, productDescription:string) {

  if(productDescription == ""){
    alert("Error: Description is empty!.");
    return productDescription;
  }else {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that enhances product descriptions for SEO and appeal 
            and live products posting on markeplaces and to attaract customers. 
            also follow below instructions strictly:
            1. Always return only the product description.
            2. Since the user will auto-publish it to a marketplace, ensure that only the product description is returned, without any additional information.
            3. If the product description is empty, respond with a standard product description that emphasizes quality, suitable for any product. Do not ask for the product description.
            4. Enhance the product description with HTML formatting best in class use poper formating, tables if require, etc to ensure it looks professional and adheres to industry standards.
            5. Make desciprion wording and sentences good, ensuring infringement voilation. and should be proper and best than previous
            `,
          },
          {
            role: "user",
            content: `Enhance the following product description: ${productDescription}`,
          },
        ],
      });
  
      return response.choices[0].message?.content || "Enhancement not available."; // Ensure a string is returned
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      alert("Error enhancing description. Please try again later.");
      return productDescription; // User-friendly error message
    }
  }

 
}

const removeBackground = async (imageUrl: string | URL | Request) => {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch the image");
    }

    // Convert the fetched image to a Blob
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("image_file", blob, "image.jpg"); // Appending the blob as a file
    
    // Call ClipDrop API with the Blob
    const clipDropResponse = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': '4a72bcbdd63d5ee6e520f8297cf8401be652e4c8415facb8bac9bda7e2c15208e06c32d10ea552d33a995660648273c2',
      },
      body: formData,
    });

    if (!clipDropResponse.ok) {
      throw new Error("Background removal failed");
    }

    // Get the result as a Blob or Object URL
    const resultBlob = await clipDropResponse.blob();
    const resultUrl = URL.createObjectURL(resultBlob); // Convert the blob to an object URL

    return resultUrl;
  } catch (error) {
    console.error("Error removing background:", error);
    alert("Background removal failed. Please try again.");
    return null;
  }
};


const updateShopifyImage = async (productId: any, newImageUrl: any) => {

  
  const query = `
    mutation updateProductImage($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          images(first: 1) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      id: `gid://shopify/Product/${productId}`,
      images: [
        {
          src: newImageUrl,
        },
      ],
    },
  };

  try {
    const response = await fetch("/path/to/shopify/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "YOUR_SHOPIFY_API_TOKEN",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error("Error updating Shopify image");
    }

    return data.data.productUpdate.product.images.edges[0].node.url;
  } catch (error) {
    console.error("Error updating Shopify image:", error);
    alert("Error updating Shopify image. Please try again.");
    return null;
  }
};



// Loader function to fetch product data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }

  const response = await admin.graphql(`
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        descriptionHtml
        priceRange {
          minVariantPrice {
            amount
          }
        }
        featuredImage {
          url
        }
      }
    }
  `, {
    variables: { id: `gid://shopify/Product/${productId}` },
  });

  const responseJson = await response.json();
  const product = responseJson.data.product;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return json({ product });
};

// Main Product Details Page Component
export default function ProductDetailsPage() {
  const { product } = useLoaderData<typeof loader>();
  const [description, setDescription] = useState(product.descriptionHtml || "");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [descriptionImage, setDescriptionImage] = useState("");

  const enhanceDescription = async () => {
    setIsEnhancing(true);
    const enhancedDescription = await generateProductDescription(openai, description);
    setDescription(enhancedDescription);
    setIsEnhancing(false);
  };

  const handleRemoveBackground = async () => {
    setIsEnhancing(true); // Show loading state
    
    // Step 1: Get the original image URL
    const originalImageUrl = product.featuredImage?.url;
  
    if (!originalImageUrl) {
      alert("No image found for background removal");
      setIsEnhancing(false);
      return;
    }
  
    // Step 2: Call the background removal API
    const newImageUrl = await removeBackground(originalImageUrl);
  
    if (!newImageUrl) {
      setIsEnhancing(false);
      return;
    }
  
    // Step 3: Update the image in Shopify
    const updatedImageUrl = await updateShopifyImage(product.id, newImageUrl);
  
    if (updatedImageUrl) {
      alert("Background removed and image updated successfully!");
      window.location.reload(); // Reload to reflect the updated image
    }
  
    setIsEnhancing(false);
  };
  
  const handleGenerateTranscript = async () => {
    setIsEnhancing(true);
  
    const imageUrl = product.featuredImage?.url;
    console.log(imageUrl);
    if (!imageUrl) {
      alert("No image found for product.");
      setIsEnhancing(false);
      return;
    }
    
    const generatedDescription = await generateProductDescriptionFromImage(openai, imageUrl);
    setDescriptionImage(generatedDescription);
    setIsEnhancing(false);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 cls-header">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img
                className="aspect-square rounded-md object-cover cls-navbar-logo"
                height="64"
                src="https://framerusercontent.com/images/VZDG1IVKiqJn0qxBmnDJMfSRFU.png?scale-down-to=512"
                width="200"
                alt="Logo"
              />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-2">
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary cls-active-nav"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 cls-header">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground cls-active-nav"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 cls-header-search"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full cls-header-search">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-3 mt-4 cls-mainpage">
          <CardHeader className="cls-mainpage-header row">
            <CardTitle className='cls-page-title'>
              <span className='cls-page-title-wrap'>{product.title}</span>
              <Button variant="gooeyRight" size="sm" className="h-8 gap-1 cls-save-product-btn">
                <SaveIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Save Changes
                </span>
              </Button>
            </CardTitle>
          </CardHeader>

          <Card>
            <CardContent>
              <div className="grid w-full gap-2 mt-6 cls-product-page-main row">
                <div className='cls-image-main'>
                  {/* <span className='cls-topic-title'>Product Image Transcript</span><br/> */}
                  <img
                    alt={product.title}
                    className="aspect-square rounded-md object-cover cls-product-img-main"
                    src={product.featuredImage?.url || "../../src/custom/image_product.png"}
                  />
                  <div className='cls-img-btn-group'>
                    <Button
                      variant="gooeyRight"
                      size="sm"
                      className="h-8 gap-1 cls-image-btn"
                      onClick={handleRemoveBackground}
                      disabled={isEnhancing}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      {isEnhancing ? "Removing..." : "Remove Background"}
                    </Button> <br/>
                    <Button
                      variant="gooeyRight"
                      size="sm"
                      className="h-8 gap-1 cls-image-btn mt-5"
                      onClick={handleGenerateTranscript}
                      disabled={isEnhancing}
                    >
                      <StarsIcon className="h-3.5 w-3.5" />
                      Generate Transcript &nbsp;
                    </Button>
                    <br/><br/><br/><br/><br/>
                  </div>
                  <div className='cls-img-editor-group'>
                    <Editor
                      apiKey='ij0y6skvh4a2fzemutj6o4zp0r2p294bu2vgjqjhmzy4qcw9' // Replace with your actual TinyMCE API key
                      init={{
                        plugins: [
                          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                        ],
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | spellcheckdialog typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                        tinycomments_mode: 'embedded',
                        body_class: 'cls-img-texteditor'
                      }}
                      value={descriptionImage}
                      onEditorChange={(newContent) => setDescriptionImage(newContent)}
                    />
                  </div>
                </div>
                <div className='cls-editor-main'>
                  {/* <span>Product Image Transcript</span> */}
                  <Button
                    variant="gooeyRight"
                    size="sm"
                    className="h-8 gap-1 cls-save-product-btn cls-ai-enhance-btn"
                    onClick={enhanceDescription}
                    disabled={isEnhancing}
                  >
                    <StarsIcon className="h-3.5 w-3.5" />
                    {isEnhancing ? "Enhancing..." : "Enhance"}
                  </Button>
                  <Editor
                    apiKey='ij0y6skvh4a2fzemutj6o4zp0r2p294bu2vgjqjhmzy4qcw9' // Replace with your actual TinyMCE API key
                    init={{
                      plugins: [
                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                      ],
                      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | spellcheckdialog typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                      tinycomments_mode: 'embedded',
                      body_class: 'cls-texteditor'
                    }}
                    value={description}
                    onEditorChange={(newContent) => setDescription(newContent)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
