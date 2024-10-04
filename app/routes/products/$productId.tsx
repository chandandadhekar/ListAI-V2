// File: routes/products/$productId.tsx
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

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
    variables: { id: `gid://shopify/Product/${params.productId}` },
  });

  // const product = response.data.product;
  // return json({ product });

  const responseJson = await response.json();
  const product = responseJson.data.product;
  return json({ product });

};

export default function ProductDetailsPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{product.title}</h1>
      <img src={product.featuredImage?.url || "https://via.placeholder.com/150"} alt={product.title} width="150" />
      <p dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}></p>
      <p>Price: ${product.priceRange.minVariantPrice.amount}</p>
    </div>
  );
}
