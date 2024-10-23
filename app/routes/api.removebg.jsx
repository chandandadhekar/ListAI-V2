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

  const url = data.url;
  const _action = data._action;

  if (!url || !_action) { // Make sure to check for 'url' instead of 'productId'
    return json({
      message: "Missing data. Required data: url, _action",
      method: _action
    }, { status: 400 });
  }

  let response;

  switch (_action) {

    case "POST": {
      try {
        // Call the background removal API
        const apiResponse = await fetch(`https://mergeline.in/rem.php?url=${url}`, {
          method: 'GET',
        });

        // Check if the request was successful
        if (!apiResponse.ok) {
          throw new Error("Failed to remove background");
        }

        const result = await apiResponse.json();
        return json({ message: "Background removed", imageUrl: result.url }, { status: 200 });
      } catch (error) {
        console.error("Error removing background:", error);
        return json({ message: "Background removal failed. Please try again." }, { status: 500 });
      }
    }

    default:
      return new Response("Method Not Allowed", { status: 405 });
  }

  return json(response);
}
