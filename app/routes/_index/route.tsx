
import '../../tailwind.css';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{backgroundImage: "url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')", opacity: 0.2}}></div>
      <Card className="w-full max-w-md z-10 bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">Login to Shopify</CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form className="space-y-6" method="post" action="/auth/login">
              <div className="space-y-2">
                <Label htmlFor="shop" className="text-sm font-medium text-gray-700">
                  Shop domain
                </Label>
                <Input
                  id="shop"
                  name="shop"
                  type="text"
                  placeholder="my-shop-domain.myshopify.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500">
                  e.g: example.myshopify.com
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105" type="submit">
                Continue
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}