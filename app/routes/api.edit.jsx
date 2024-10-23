import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }) { 
  let data;
  const contentType = request.headers.get("Content-Type");
  const { admin, session } = await authenticate.admin(request); 

  if (contentType.includes("application/json")) {
    data = await request.json(); 
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData(); 
    data = Object.fromEntries(formData);
  } else {
    return json({ message: "Unsupported content type" }, { status: 400 });
  }

  const productId = data.productId;
  const description = data.description;
  const image = data.image;
  const _action = data._action;

  if (!productId || !description || !_action) {
    return json({
      message: "Missing data. Required data: productId, description, _action",
      method: _action
    }, { status: 400 });
  }

  let response;

  switch (_action) {

    case "CREATE":
      response = { message: "Item created", method: "Create" };
      break;

    case "PATCH": {
      const payload = {
        product: {
          id: productId,
          body_html: description,
          images: [
            {
              src: image
            }
          ]
        }
      };

      const url = `https://${session.shop}/admin/api/2024-10/products/${productId}.json`;

      try {
        if (!session.accessToken) {
          throw new Error("Access token is undefined. Please check your session.");
        }

        const shopifyResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': session.accessToken
          },
          body: JSON.stringify(payload),
        });

        const responseJson = await shopifyResponse.json();

        if (shopifyResponse.ok) {
          response = {
            message: "Product description updated successfully!",
            product: responseJson.product
          };
        } else {
          console.error("Error response from Shopify:", responseJson);
          return json({
            message: `Failed to update product description: ${responseJson.errors}`
          }, { status: shopifyResponse.status });
        }
      } catch (error) {
        console.error("Error updating product description:", error);
        return json({
          message: "An error occurred while updating the product description.",
          error: error.message
        }, { status: 500 });
      }
      break;
    }

    case "DELETE":
      response = { message: "Item deleted", method: "Delete" };
      break;

    default:
      return new Response("Method Not Allowed", { status: 405 });
  }

  return json(response);
}
