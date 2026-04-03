import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink, Code2, Server, Database, FileJson } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const BASE_URL = "https://qjomlibklepwwhlohdwy.supabase.co/functions/v1";

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: object;
  responseExample: object;
}

const methodColors = {
  GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
};

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: EndpointProps }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
          <Badge variant="outline" className={`${methodColors[endpoint.method]} font-mono text-xs px-2.5`}>
            {endpoint.method}
          </Badge>
          <code className="flex-1 font-mono text-sm">{endpoint.path}</code>
          <span className="text-sm text-muted-foreground hidden sm:block">{endpoint.description}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-2 space-y-4 border-l-2 border-muted pl-4 pb-4">
          <p className="text-sm text-muted-foreground sm:hidden">{endpoint.description}</p>
          
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Query Parameters</h4>
              <div className="rounded-lg border bg-muted/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">Required</th>
                      <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param) => (
                      <tr key={param.name} className="border-t border-muted">
                        <td className="px-3 py-2 font-mono text-primary">{param.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                        <td className="px-3 py-2">
                          {param.required ? (
                            <Badge variant="destructive" className="text-[10px]">Required</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Request Body</h4>
              <CodeBlock code={JSON.stringify(endpoint.requestBody, null, 2)} />
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold">Response Example</h4>
            <CodeBlock code={JSON.stringify(endpoint.responseExample, null, 2)} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const moviesEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/movies",
    description: "List all movies with pagination and filters",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status (draft, published, archived)" },
      { name: "genre", type: "string", required: false, description: "Filter by genre" },
      { name: "language", type: "string", required: false, description: "Filter by language" },
      { name: "vendor_id", type: "uuid", required: false, description: "Filter by vendor" },
      { name: "limit", type: "integer", required: false, description: "Number of results (default: 50)" },
      { name: "offset", type: "integer", required: false, description: "Pagination offset (default: 0)" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          title: "Movie Title",
          genre: "Action",
          language: "Hindi",
          status: "published",
          views: 1234,
          vendors: { id: "uuid", name: "Vendor Name", company_name: "Company" }
        }
      ],
      count: 100,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "GET",
    path: "/movies/:id",
    description: "Get a single movie by ID",
    responseExample: {
      data: {
        id: "uuid",
        title: "Movie Title",
        genre: "Action",
        language: "Hindi",
        description: "Movie description",
        duration: "2h 30m",
        rating: "8.5",
        status: "published",
        vendors: { id: "uuid", name: "Vendor Name" }
      }
    }
  },
  {
    method: "POST",
    path: "/movies",
    description: "Create a new movie",
    requestBody: {
      title: "Movie Title",
      genre: "Action",
      language: "Hindi",
      description: "Movie description",
      duration: "2h 30m",
      rating: "8.5",
      age_rating: "UA",
      release_date: "2026-01-15",
      video_url: "https://...",
      thumbnail_url: "https://...",
      vendor_id: "uuid",
      status: "draft",
      subscription_required: false,
      ads_enabled: true,
      genres: ["Action", "Thriller"],
      tags: ["blockbuster"],
      cast_crew: []
    },
    responseExample: {
      data: { id: "uuid", title: "Movie Title" },
      message: "Movie created successfully"
    }
  },
  {
    method: "PUT",
    path: "/movies/:id",
    description: "Update an existing movie",
    requestBody: {
      title: "Updated Title",
      status: "published"
    },
    responseExample: {
      data: { id: "uuid", title: "Updated Title" },
      message: "Movie updated successfully"
    }
  },
  {
    method: "DELETE",
    path: "/movies/:id",
    description: "Delete a movie",
    responseExample: {
      message: "Movie deleted successfully"
    }
  }
];

const shortMoviesEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/short-movies",
    description: "List all short movies",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status" },
      { name: "genre", type: "string", required: false, description: "Filter by genre" },
      { name: "limit", type: "integer", required: false, description: "Number of results" },
      { name: "offset", type: "integer", required: false, description: "Pagination offset" },
    ],
    responseExample: {
      data: [{ id: "uuid", title: "Short Film", genre: "Drama", duration: "15m" }],
      count: 50,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "POST",
    path: "/short-movies",
    description: "Create a new short movie",
    requestBody: {
      title: "Short Film Title",
      genre: "Drama",
      language: "Hindi",
      director: "Director Name",
      duration: "15m"
    },
    responseExample: {
      data: { id: "uuid", title: "Short Film Title" },
      message: "Short movie created successfully"
    }
  }
];

const tvShowsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/tv-shows",
    description: "List all TV shows with vendor info",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status" },
      { name: "channel", type: "string", required: false, description: "Filter by channel" },
      { name: "limit", type: "integer", required: false, description: "Number of results" },
    ],
    responseExample: {
      data: [{ id: "uuid", title: "TV Show", channel: "Star Plus", total_episodes: 100 }],
      count: 20,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "GET",
    path: "/tv-shows/:id",
    description: "Get TV show with all seasons and episodes",
    responseExample: {
      data: {
        id: "uuid",
        title: "TV Show",
        seasons: [
          {
            id: "uuid",
            season_number: 1,
            episodes: [{ id: "uuid", episode_number: 1, title: "Episode 1" }]
          }
        ]
      }
    }
  },
  {
    method: "POST",
    path: "/tv-shows/:id/seasons",
    description: "Add a new season to a TV show",
    requestBody: {
      season_number: 1,
      title: "Season 1",
      description: "First season"
    },
    responseExample: {
      data: { id: "uuid", season_number: 1 },
      message: "Season created successfully"
    }
  },
  {
    method: "POST",
    path: "/tv-shows/:id/episodes",
    description: "Add a new episode",
    requestBody: {
      season_id: "uuid",
      episode_number: 1,
      title: "Episode Title",
      duration: "45m",
      video_url: "https://..."
    },
    responseExample: {
      data: { id: "uuid", episode_number: 1 },
      message: "Episode created successfully"
    }
  }
];

const webSeriesEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/web-series",
    description: "List all web series",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status" },
      { name: "genre", type: "string", required: false, description: "Filter by genre" },
    ],
    responseExample: {
      data: [{ id: "uuid", title: "Web Series", genre: "Thriller", total_episodes: 8 }],
      count: 15,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "GET",
    path: "/web-series/:id",
    description: "Get web series with seasons and episodes",
    responseExample: {
      data: {
        id: "uuid",
        title: "Web Series",
        seasons: [
          {
            id: "uuid",
            season_number: 1,
            episodes: [{ id: "uuid", episode_number: 1, title: "Pilot" }]
          }
        ]
      }
    }
  }
];

const vendorsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/vendors",
    description: "List all vendors",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status (active, pending, suspended)" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          name: "Vendor Name",
          email: "vendor@example.com",
          company_name: "Company",
          status: "active",
          commission_rate: 15
        }
      ],
      count: 10,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "GET",
    path: "/vendors/:id/content",
    description: "Get all content uploaded by a vendor",
    parameters: [
      { name: "type", type: "string", required: false, description: "Filter by content type (movies, web_series, tv_shows, short_movies)" },
    ],
    responseExample: {
      data: {
        movies: [{ id: "uuid", title: "Movie", status: "published" }],
        web_series: [{ id: "uuid", title: "Series", status: "draft" }],
        tv_shows: [],
        short_movies: [],
        totals: {
          movies: 5,
          web_series: 2,
          tv_shows: 0,
          short_movies: 3,
          total: 10
        }
      }
    }
  },
  {
    method: "POST",
    path: "/vendors",
    description: "Create a new vendor",
    requestBody: {
      name: "Vendor Name",
      email: "vendor@example.com",
      phone: "+91 98765 43210",
      company_name: "Company Name",
      commission_rate: 15,
      status: "pending"
    },
    responseExample: {
      data: { id: "uuid", name: "Vendor Name" },
      message: "Vendor created successfully"
    }
  }
];

const homeLayoutEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/home-layout",
    description: "Get complete home layout with banners (enriched from content) and sections",
    parameters: [
      { name: "tab", type: "string", required: false, description: "Tab name (home, originals, movies, tv_shows, web_series, short_movies)" },
      { name: "user_id", type: "uuid", required: false, description: "User ID for personalized content like Continue Watching" },
    ],
    responseExample: {
      tab: "home",
      banners: [
        {
          id: "uuid",
          title: "Auto-fetched from content or custom override",
          subtitle: "Tagline from content or custom",
          genre_text: "Hindi · Action (auto-generated from content)",
          background_image_url: "https://storage.../banner.jpg",
          mobile_image_url: "https://storage.../mobile.jpg",
          logo_image_url: "https://storage.../logo.png",
          cta_text: "Watch Now",
          cta_redirect_type: "movie",
          content_id: "uuid",
          content_title: "Original content title",
          content_genre: "Action",
          content_language: "Hindi",
          content_description: "Content description",
          visible_tabs: ["home", "movies"],
          auto_slide_duration: 5,
          allow_swipe: true
        }
      ],
      sections: [
        {
          id: "uuid",
          title: "Trending Now",
          section_type: "trending_now",
          display_style: "horizontal_banner",
          content: [{ id: "uuid", title: "Movie", _content_type: "movies" }]
        }
      ],
      settings: { banner_limit: 8, continue_watching_enabled: true }
    }
  },
  {
    method: "GET",
    path: "/home-layout/banners",
    description: "Get banners with auto-fetched content data (title, genre, language from selected movie/series)",
    parameters: [
      { name: "tab", type: "string", required: false, description: "Tab name" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          title: "Banner Title (from content if not overridden)",
          subtitle: "Tagline from content",
          genre_text: "Hindi · Thriller (auto-generated)",
          background_image_url: "https://storage.../banner.jpg",
          mobile_image_url: "https://storage.../mobile.jpg",
          logo_image_url: "https://storage.../logo.png",
          cta_redirect_type: "movie",
          content_id: "uuid",
          content_title: "Original Movie Title",
          content_genre: "Thriller",
          content_language: "Hindi",
          visible_tabs: ["home", "movies"],
          is_active: true
        }
      ]
    }
  },
  {
    method: "GET",
    path: "/home-layout/sections",
    description: "Get section metadata with layout style (horizontal_banner, vertical_banner, big_horizontal, big_vertical, index_horizontal, index_vertical)",
    parameters: [
      { name: "tab", type: "string", required: false, description: "Tab name" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          title: "Trending Now",
          section_type: "trending_now",
          content_type: "all",
          content_source: "most_viewed",
          display_style: "index_horizontal",
          display_order: 0,
          item_limit: 20,
          is_original_only: false,
          visible_tabs: ["home", "movies"]
        }
      ]
    }
  },
  {
    method: "GET",
    path: "/home-layout/settings",
    description: "Get all home settings",
    responseExample: {
      data: {
        banner_limit: 8,
        continue_watching_enabled: true,
        trending_auto_mode: true,
        originals_show_movies: true,
        originals_show_web_series: true
      }
    }
  }
];

const subscriptionsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/subscriptions",
    description: "List all subscription plans with filters",
    parameters: [
      { name: "is_active", type: "boolean", required: false, description: "Filter by active status (true/false)" },
      { name: "duration", type: "string", required: false, description: "Filter by duration (monthly, yearly, etc.)" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          name: "Premium",
          price: 199.00,
          duration: "monthly",
          features: ["4K Ultra HD", "Watch on 2 devices", "Full content library", "Ad-free experience"],
          max_devices: 2,
          max_downloads: 10,
          has_ads: false,
          quality: "4K",
          is_active: true,
          sort_order: 2
        }
      ],
      count: 3
    }
  },
  {
    method: "GET",
    path: "/subscriptions/:id",
    description: "Get a single subscription plan by ID",
    responseExample: {
      data: {
        id: "uuid",
        name: "Premium",
        price: 199.00,
        duration: "monthly",
        features: ["4K Ultra HD", "Watch on 2 devices", "Full content library", "Ad-free experience"],
        max_devices: 2,
        max_downloads: 10,
        has_ads: false,
        quality: "4K",
        is_active: true,
        sort_order: 2,
        created_at: "2026-01-27T10:00:00Z",
        updated_at: "2026-01-27T10:00:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/subscriptions",
    description: "Create a new subscription plan",
    requestBody: {
      name: "Premium Plus",
      price: 299.00,
      duration: "monthly",
      features: ["4K Ultra HD + HDR", "Watch on 5 devices", "Priority Support"],
      max_devices: 5,
      max_downloads: 25,
      has_ads: false,
      quality: "4K_HDR",
      is_active: true,
      sort_order: 4
    },
    responseExample: {
      data: { id: "uuid", name: "Premium Plus", price: 299.00 },
      message: "Subscription plan created successfully"
    }
  },
  {
    method: "PUT",
    path: "/subscriptions/:id",
    description: "Update an existing subscription plan",
    requestBody: {
      name: "Premium Plus",
      price: 349.00,
      features: ["Updated features"],
      is_active: true
    },
    responseExample: {
      data: { id: "uuid", name: "Premium Plus", price: 349.00 },
      message: "Subscription plan updated successfully"
    }
  },
  {
    method: "DELETE",
    path: "/subscriptions/:id",
    description: "Delete a subscription plan",
    responseExample: {
      message: "Subscription plan deleted successfully"
    }
  }
];

const categoriesEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/categories",
    description: "List all categories with filters",
    parameters: [
      { name: "is_active", type: "boolean", required: false, description: "Filter by active status (true/false)" },
      { name: "parent_id", type: "uuid", required: false, description: "Filter by parent category" },
      { name: "slug", type: "string", required: false, description: "Filter by slug" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          name: "Action",
          slug: "action",
          description: "High-energy movies with exciting stunts",
          icon: "Swords",
          parent_id: null,
          is_active: true,
          sort_order: 1
        }
      ],
      count: 8
    }
  },
  {
    method: "GET",
    path: "/categories/:id",
    description: "Get a single category by ID",
    responseExample: {
      data: {
        id: "uuid",
        name: "Action",
        slug: "action",
        description: "High-energy movies with exciting stunts",
        icon: "Swords",
        parent_id: null,
        is_active: true,
        sort_order: 1,
        created_at: "2026-01-27T10:00:00Z",
        updated_at: "2026-01-27T10:00:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/categories",
    description: "Create a new category",
    requestBody: {
      name: "Thriller",
      slug: "thriller",
      description: "Suspenseful and gripping stories",
      icon: "AlertTriangle",
      parent_id: null,
      is_active: true,
      sort_order: 7
    },
    responseExample: {
      data: { id: "uuid", name: "Thriller", slug: "thriller" },
      message: "Category created successfully"
    }
  },
  {
    method: "PUT",
    path: "/categories/:id",
    description: "Update an existing category",
    requestBody: {
      name: "Thriller & Suspense",
      description: "Updated description",
      is_active: true
    },
    responseExample: {
      data: { id: "uuid", name: "Thriller & Suspense" },
      message: "Category updated successfully"
    }
  },
  {
    method: "DELETE",
    path: "/categories/:id",
    description: "Delete a category",
    responseExample: {
      message: "Category deleted successfully"
    }
  }
];

const appUsersEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/app-users",
    description: "List all app users with filters and pagination",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by status (active, inactive, suspended)" },
      { name: "subscription_plan", type: "string", required: false, description: "Filter by plan (free, basic, premium, enterprise)" },
      { name: "login_method", type: "string", required: false, description: "Filter by login method (email, google, phone)" },
      { name: "search", type: "string", required: false, description: "Search by name or email" },
      { name: "limit", type: "integer", required: false, description: "Number of results (default: 50)" },
      { name: "offset", type: "integer", required: false, description: "Pagination offset (default: 0)" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          name: "John Doe",
          email: "john@example.com",
          phone: "+91 98765 43210",
          status: "active",
          subscription_plan: "premium",
          login_method: "google",
          devices_count: 2,
          total_watch_time: 3600,
          last_active_at: "2026-01-27T10:00:00Z"
        }
      ],
      count: 150,
      limit: 50,
      offset: 0
    }
  },
  {
    method: "GET",
    path: "/app-users/:id",
    description: "Get a single user by ID",
    responseExample: {
      data: {
        id: "uuid",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        avatar_url: "https://...",
        status: "active",
        subscription_plan: "premium",
        login_method: "google",
        devices_count: 2,
        total_watch_time: 3600,
        notes: "VIP user",
        last_active_at: "2026-01-27T10:00:00Z",
        created_at: "2026-01-01T10:00:00Z",
        updated_at: "2026-01-27T10:00:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/app-users",
    description: "Create a new app user",
    requestBody: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 98765 43211",
      status: "active",
      subscription_plan: "free",
      login_method: "email"
    },
    responseExample: {
      data: { id: "uuid", name: "Jane Smith", email: "jane@example.com" },
      message: "User created successfully"
    }
  },
  {
    method: "PUT",
    path: "/app-users/:id",
    description: "Update an existing user",
    requestBody: {
      name: "Jane Smith Updated",
      subscription_plan: "premium",
      status: "active"
    },
    responseExample: {
      data: { id: "uuid", name: "Jane Smith Updated", subscription_plan: "premium" },
      message: "User updated successfully"
    }
  },
  {
    method: "DELETE",
    path: "/app-users/:id",
    description: "Delete a user",
    responseExample: {
      message: "User deleted successfully"
    }
  }
];

const adsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/ads",
    description: "List all ad settings with filters",
    parameters: [
      { name: "placement", type: "string", required: false, description: "Filter by placement (home_banner, video_preroll, etc.)" },
      { name: "provider", type: "string", required: false, description: "Filter by provider (google, facebook)" },
      { name: "ad_type", type: "string", required: false, description: "Filter by ad type (banner, interstitial, rewarded)" },
      { name: "is_enabled", type: "boolean", required: false, description: "Filter by enabled status" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          placement: "home_banner",
          provider: "google",
          ad_type: "banner",
          ad_unit_id: "ca-app-pub-xxx/xxx",
          app_id: "ca-app-pub-xxx",
          is_enabled: true,
          frequency_cap: 5
        }
      ],
      count: 4
    }
  },
  {
    method: "GET",
    path: "/ads/:id",
    description: "Get a single ad setting by ID",
    responseExample: {
      data: {
        id: "uuid",
        placement: "video_preroll",
        provider: "google",
        ad_type: "interstitial",
        ad_unit_id: "ca-app-pub-xxx/xxx",
        app_id: "ca-app-pub-xxx",
        is_enabled: true,
        frequency_cap: 3,
        created_at: "2026-01-27T10:00:00Z",
        updated_at: "2026-01-27T10:00:00Z"
      }
    }
  },
  {
    method: "POST",
    path: "/ads",
    description: "Create a new ad setting",
    requestBody: {
      placement: "content_feed",
      provider: "google",
      ad_type: "native",
      ad_unit_id: "ca-app-pub-xxx/xxx",
      app_id: "ca-app-pub-xxx",
      is_enabled: true,
      frequency_cap: 10
    },
    responseExample: {
      data: { id: "uuid", placement: "content_feed", ad_type: "native" },
      message: "Ad setting created successfully"
    }
  },
  {
    method: "PUT",
    path: "/ads/:id",
    description: "Update an existing ad setting",
    requestBody: {
      is_enabled: false,
      frequency_cap: 5
    },
    responseExample: {
      data: { id: "uuid", placement: "content_feed", is_enabled: false },
      message: "Ad setting updated successfully"
    }
  },
  {
    method: "DELETE",
    path: "/ads/:id",
    description: "Delete an ad setting",
    responseExample: {
      message: "Ad setting deleted successfully"
    }
  }
];

const watchProgressEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/watch-progress?user_id=xxx",
    description: "Get user's continue watching list",
    parameters: [
      { name: "user_id", type: "uuid", required: true, description: "User ID" },
      { name: "limit", type: "integer", required: false, description: "Number of results" },
      { name: "content_type", type: "string", required: false, description: "Filter by content type" },
    ],
    responseExample: {
      data: [
        {
          id: "uuid",
          content_type: "movie",
          content_id: "uuid",
          progress_seconds: 1800,
          duration_seconds: 7200,
          progress_percentage: 25,
          last_watched_at: "2026-01-27T10:00:00Z",
          content: { id: "uuid", title: "Movie Title", thumbnail_url: "https://..." }
        }
      ]
    }
  },
  {
    method: "POST",
    path: "/watch-progress?user_id=xxx",
    description: "Update watch progress",
    requestBody: {
      content_type: "movie",
      content_id: "uuid",
      episode_id: null,
      progress_seconds: 1800,
      duration_seconds: 7200
    },
    responseExample: {
      data: {
        id: "uuid",
        progress_percentage: 25,
        is_completed: false,
        last_watched_at: "2026-01-27T10:00:00Z"
      }
    }
  },
  {
    method: "DELETE",
    path: "/watch-progress?user_id=xxx&content_id=xxx&content_type=movie",
    description: "Remove from continue watching",
    parameters: [
      { name: "user_id", type: "uuid", required: true, description: "User ID" },
      { name: "content_id", type: "uuid", required: true, description: "Content ID" },
      { name: "content_type", type: "string", required: true, description: "Content type" },
    ],
    responseExample: {
      success: true
    }
  }
];

const searchEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/search",
    description: "Unified search across all content types",
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query (min 2 characters)" },
      { name: "type", type: "string", required: false, description: "Content type filter (movies, web_series, tv_shows, short_movies, or all)" },
      { name: "genre", type: "string", required: false, description: "Filter by genre" },
      { name: "language", type: "string", required: false, description: "Filter by language" },
      { name: "status", type: "string", required: false, description: "Filter by status (default: published)" },
      { name: "limit", type: "integer", required: false, description: "Number of results (default: 20)" },
      { name: "offset", type: "integer", required: false, description: "Pagination offset (default: 0)" },
    ],
    responseExample: {
      query: "action",
      total_count: 25,
      results: [
        {
          id: "uuid",
          title: "Action Movie Title",
          description: "An exciting action movie...",
          genre: "Action",
          language: "Hindi",
          thumbnail_url: "https://...",
          content_type: "movies"
        },
        {
          id: "uuid",
          title: "Action Web Series",
          description: "Thrilling action series...",
          genre: "Action",
          language: "English",
          thumbnail_url: "https://...",
          content_type: "web_series"
        }
      ],
      by_type: {
        movies: [{ id: "uuid", title: "Movie 1", content_type: "movies" }],
        web_series: [{ id: "uuid", title: "Series 1", content_type: "web_series" }],
        tv_shows: [],
        short_movies: []
      },
      filters: { genre: null, language: null, status: null },
      pagination: { limit: 20, offset: 0 }
    }
  },
  {
    method: "GET",
    path: "/search?type=movies",
    description: "Search only in movies",
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
      { name: "type", type: "string", required: true, description: "Set to 'movies'" },
    ],
    responseExample: {
      query: "thriller",
      total_count: 8,
      results: [
        {
          id: "uuid",
          title: "Thriller Movie",
          genre: "Thriller",
          language: "Hindi",
          content_type: "movies"
        }
      ],
      by_type: {
        movies: [{ id: "uuid", title: "Thriller Movie", content_type: "movies" }]
      },
      pagination: { limit: 20, offset: 0 }
    }
  }
];

const recommendationsEndpoints: EndpointProps[] = [
  {
    method: "GET",
    path: "/recommendations",
    description: "Get personalized content recommendations based on user watch history",
    parameters: [
      { name: "user_id", type: "uuid", required: true, description: "User ID to get recommendations for" },
      { name: "type", type: "string", required: false, description: "Filter by content type (movies, web_series, tv_shows, short_movies)" },
      { name: "limit", type: "integer", required: false, description: "Number of recommendations (default: 20)" },
    ],
    responseExample: {
      user_id: "uuid",
      preferences: {
        top_genres: ["Action", "Thriller", "Drama"],
        top_languages: ["Hindi", "English"],
        watch_history_count: 15
      },
      recommendations: [
        {
          id: "uuid",
          title: "Recommended Movie",
          genre: "Action",
          language: "Hindi",
          thumbnail_url: "https://...",
          rating: "8.5",
          views: 1500,
          content_type: "movies"
        }
      ],
      sections: {
        for_you: [{ id: "uuid", title: "Personalized Pick", content_type: "movies" }],
        trending: [{ id: "uuid", title: "Trending Now", content_type: "web_series" }],
        new_releases: [{ id: "uuid", title: "New Release", content_type: "movies" }]
      },
      total_count: 20
    }
  }
];

export default function ApiDocs() {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(BASE_URL);
    setCopiedUrl(true);
    toast.success("Base URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-sm text-muted-foreground">
            Complete REST API reference for content management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Server className="h-3.5 w-3.5" />
            REST API
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </Badge>
        </div>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Base URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted px-4 py-2.5 font-mono text-sm">
              {BASE_URL}
            </code>
            <Button variant="outline" size="sm" onClick={copyBaseUrl}>
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All endpoints are public. For production, add authentication headers.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">13</p>
              <p className="text-xs text-muted-foreground">Resources</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Code2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">30+</p>
              <p className="text-xs text-muted-foreground">Endpoints</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Server className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">REST</p>
              <p className="text-xs text-muted-foreground">Protocol</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <FileJson className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">JSON</p>
              <p className="text-xs text-muted-foreground">Format</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Endpoints */}
      <Tabs defaultValue="movies" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full h-auto p-1 gap-1">
            <TabsTrigger value="movies" className="text-xs py-2 px-3 whitespace-nowrap">Movies</TabsTrigger>
            <TabsTrigger value="short-movies" className="text-xs py-2 px-3 whitespace-nowrap">Short Movies</TabsTrigger>
            <TabsTrigger value="tv-shows" className="text-xs py-2 px-3 whitespace-nowrap">TV Shows</TabsTrigger>
            <TabsTrigger value="web-series" className="text-xs py-2 px-3 whitespace-nowrap">Web Series</TabsTrigger>
            <TabsTrigger value="search" className="text-xs py-2 px-3 whitespace-nowrap">Search</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs py-2 px-3 whitespace-nowrap">Recommendations</TabsTrigger>
            <TabsTrigger value="vendors" className="text-xs py-2 px-3 whitespace-nowrap">Vendors</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs py-2 px-3 whitespace-nowrap">Categories</TabsTrigger>
            <TabsTrigger value="app-users" className="text-xs py-2 px-3 whitespace-nowrap">App Users</TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs py-2 px-3 whitespace-nowrap">Subscriptions</TabsTrigger>
            <TabsTrigger value="ads" className="text-xs py-2 px-3 whitespace-nowrap">Ads</TabsTrigger>
            <TabsTrigger value="home-layout" className="text-xs py-2 px-3 whitespace-nowrap">Home Layout</TabsTrigger>
            <TabsTrigger value="watch-progress" className="text-xs py-2 px-3 whitespace-nowrap">Watch Progress</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="movies" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Movies API</CardTitle>
              <CardDescription>Full CRUD operations for movies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {moviesEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="short-movies" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Short Movies API</CardTitle>
              <CardDescription>Manage short films and clips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {shortMoviesEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tv-shows" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">TV Shows API</CardTitle>
              <CardDescription>TV shows with seasons and episodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tvShowsEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web-series" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Web Series API</CardTitle>
              <CardDescription>Web series with seasons and episodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {webSeriesEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Search API</CardTitle>
              <CardDescription>Unified search across movies, web series, TV shows & short movies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {searchEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recommendations API</CardTitle>
              <CardDescription>Personalized content recommendations based on user watch history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendationsEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vendors API</CardTitle>
              <CardDescription>Vendor management and content tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {vendorsEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories API</CardTitle>
              <CardDescription>Content categories with parent-child hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoriesEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app-users" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">App Users API</CardTitle>
              <CardDescription>User management with subscription and login tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {appUsersEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Subscriptions API</CardTitle>
              <CardDescription>Subscription plans management (₹ INR)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {subscriptionsEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ads API</CardTitle>
              <CardDescription>Ad placements and provider configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {adsEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home-layout" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Home Layout API</CardTitle>
              <CardDescription>Dynamic home screen layout for Flutter app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {homeLayoutEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watch-progress" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Watch Progress API</CardTitle>
              <CardDescription>Continue Watching and user watch history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {watchProgressEndpoints.map((endpoint, i) => (
                <EndpointCard key={i} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Example</CardTitle>
          <CardDescription>How to call the API using fetch</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`// Fetch all published movies
const response = await fetch('${BASE_URL}/movies?status=published&limit=10');
const { data, count } = await response.json();

// Create a new movie
const newMovie = await fetch('${BASE_URL}/movies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Movie',
    genre: 'Action',
    language: 'Hindi'
  })
});`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
