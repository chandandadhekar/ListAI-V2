import '../tailwind.css';
import { Link } from "@remix-run/react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowRightIcon,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Menu,
  Package,
  Package2,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenuCheckboxItem,
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
import {
  ListFilter,
  PlusCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react"; // Import useState for local state management
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch products using Shopify GraphQL API 
  const response = await admin.graphql(`
    query getProducts {
      products(first: 100) {
        edges {
          node {
            id
            title
            status
            priceRange {
              minVariantPrice {
                amount
              }
            }
            totalInventory
            createdAt
            featuredImage {
              url
            }
          }
        }
      }
    }
  `);

  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map((edge: any) => edge.node);
  return json({ products });
};

type Product = {
  id: string;
  title: string;
  status: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  totalInventory: number;
  createdAt: string;
  featuredImage: {
    url: string;
  }
};

export default function DashboardPage() {
  const { products } = useLoaderData<typeof loader>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filteredProducts = products.filter((product: Product) => {
    if (filter === 'active') return product.status === 'ACTIVE';
    if (filter === 'draft') return product.status === 'DRAFT';
    if (filter === 'archived') return product.status === 'ARCHIVED';
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 cls-header">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              {/* <Package2 className="h-6 w-6" />
              <span className="cls-logo">Product ListAI</span> */}
              <img
                  className="aspect-square rounded-md object-cover cls-navbar-logo"
                  height="64"
                  src="https://framerusercontent.com/images/VZDG1IVKiqJn0qxBmnDJMfSRFU.png?scale-down-to=512"
                  width="200"
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
                Products{" "}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 cls-header">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
              >
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
              <Button variant="secondary" size="icon" className="rounded-full  cls-header-search">
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
            <CardTitle>
              Products
              <Button variant="gooeyRight" size="sm" className="h-8 gap-1 cls-add-product-btn">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </CardTitle>
            
          </CardHeader>
          <Tabs defaultValue="all">
            <TabsContent value="all">
              <Card>
                <CardContent>
                  <Card className='cls-filter-nav'>
                    <CardContent className='cls-card-content'>
                      <TabsList className='cls-tab-list'>
                        <span className='cls-nav-analatics'>
                          Total Products<br/>
                          <strong>{products.length}</strong>
                        </span>
                        <span className='cls-nav-analatics'>
                          Active Products<br/>
                          <strong>{products.filter((p: { status: string; }) => p.status === "ACTIVE").length}</strong>
                        </span>
                        <span className='cls-nav-analatics'>
                          Draft Products<br/>
                          <strong>{products.filter((p: { status: string; }) => p.status === "DRAFT").length}</strong>
                        </span>
                        <span className='cls-nav-analatics'>
                          Archived Products<br/>
                          <strong>{products.filter((p: { status: string; }) => p.status === "ARCHIVED").length}</strong>
                        </span>
                      </TabsList>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1 cls-filter-dropdown-btn">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Filter
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem checked={filter === 'all'} onClick={() => handleFilterChange('all')}>All</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={filter === 'active'} onClick={() => handleFilterChange('active')}>Active</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={filter === 'draft'} onClick={() => handleFilterChange('draft')}>Draft</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem checked={filter === 'archived'} onClick={() => handleFilterChange('archived')}>Archived</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                  <div className='cls-table-main'>
                    <Table>
                      <TableHeader className="cls-table-heading">
                        <TableRow className="cls-table-row">
                          <TableHead></TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {displayedProducts.map((product: Product) => (
                        <TableRow 
                          key={product.id}
                          className="cls-table-row"
                          //onClick={() => window.location.href = '/products?id=' + product.id}
                          //onClick={() => navigate(`/products/${product.id}`)}
                          onClick={() => {
                            const productId = product.id.split("/").pop(); // Get the last part of the product.id
                            window.open('/products?id=' + productId, '_blank'); // Open in a new tab
                          }}
                        >
                          <TableCell>
                            <img
                              alt={product.title}
                              className="aspect-square rounded-md object-cover cls-product-img"
                              height="64"
                              src={product.featuredImage?.url || "../../src/custom/image_product.png"}
                              width="64"
                            />
                          </TableCell>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.status}</Badge>
                          </TableCell>
                          <TableCell>
                            ${product.priceRange.minVariantPrice.amount}
                          </TableCell>
                          <TableCell>{product.totalInventory}</TableCell>
                          <TableCell>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div>
                      <span className="mx-2">{`Page ${currentPage} of ${totalPages}`} | </span>
                      <label htmlFor="pageSize" className="mr-2">Items per page:</label>
                      <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border rounded-md"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="cls-pagination">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline" size="sm"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)} // Fixed here
                        disabled={currentPage === totalPages}
                        variant="outline" size="sm"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
