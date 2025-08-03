# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `bun run dev` - Start development server at http://localhost:5173
- `bun run build` - Create production build
- `bun run start` - Start production server
- `bun run typecheck` - Run TypeScript type checking with React Router typegen

### Package Manager
- This project uses **Bun** as the package manager (bun.lockb present)
- Run `bun install` to install dependencies

## Project Architecture

### Core Tech Stack
- **React Router v7** - File-based routing with SSR support
- **Convex** - Backend-as-a-Service with real-time database
- **Better Auth** - Authentication system integrated with Convex
- **TailwindCSS** - Styling with shadcn/ui components
- **TypeScript** - Full type safety throughout

### Data Architecture
The application uses Convex as the backend with an optimized schema for Caribbean expansion and market analytics:

#### Core Tables
- `countries` - Caribbean countries with currency and regional data (Jamaica active by default)
- `banks` - Financial institutions with contact info, sale terms, and country relationships
- `vehicles` - Simplified vehicle catalog (make, model, year, slug, isActive status)
- `listings` - Vehicle listings with lifecycle management (draft/active/sold/expired/removed)
- `users` - Application users linked to Better Auth with bank relationships
- `listingFilters` - Denormalized data for high-performance search and filtering
- `marketStats` - Market analytics for vehicle pricing insights

#### Key Relationships
- `banks.countryId` → `countries._id`
- `listings.vehicleId` → `vehicles._id`
- `listings.bankId` → `banks._id`
- `users.bankId` → `banks._id` (optional)
- `listingFilters.countryId` → `countries._id`
- `marketStats.countryId` → `countries._id`

### Authentication Flow
- Uses Better Auth with email/password (no verification required)
- Bank representatives are authorized based on `banks.allowedEmails` array
- Authentication state managed through Convex adapter

### File Structure
```
app/
├── components/          # Reusable UI components
├── routes/             # File-based routing
├── vehicles/           # Vehicle-specific components
│   ├── VehicleCard/    # Card display components
│   ├── VehicleFilters/ # Filtering UI
│   └── VehicleTable/   # Table display components
├── shadcn/ui/          # shadcn/ui component library
├── types/              # TypeScript type definitions
└── lib/                # Auth configuration

convex/
├── schema.ts           # Main database schema (current)
├── schema-optimized.ts # Optimized schema for Caribbean expansion
├── countries.ts        # Country management functions
├── listings.ts         # Listing queries/mutations with status lifecycle
├── vehicles.ts         # Simplified vehicle catalog functions
├── banks.ts            # Bank data functions with country relationships
├── createVehicle.ts    # Vehicle and listing creation utilities
├── marketStats.ts      # Market analytics functions
├── auth.ts             # Better Auth integration
└── uploadHelpers.ts    # File upload utilities
```

### Key Patterns

#### Convex Function Definitions
All Convex functions use the new syntax with explicit args/returns validators:
```typescript
export const functionName = query({
  args: { param: v.string() },
  returns: v.array(v.object({ ... })),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

#### Image Handling
- Images stored in Convex file storage using storage IDs
- Listings use `coverImageId` (single) and `imageIds` (array) for organized image management
- `convex/listings.ts` converts storage IDs to URLs using `ctx.storage.getUrl()`
- Functions return both storage IDs and converted URLs for flexibility

#### Route Protection
- Dashboard routes (`/dashboard/*`) require authentication
- Bank-specific routes (`/dashboard/:bankId/listings/new`) validate user belongs to bank
- Uses Better Auth session checking

#### State Management
- No external state management library
- React Router loaders for data fetching
- Convex real-time subscriptions for live updates

### Component Conventions
- Components use TypeScript with strict typing
- Props interfaces defined inline or in separate type files
- shadcn/ui components for consistent styling
- Responsive design with Tailwind breakpoints

### Bank System
Banks have structured data including:
- **Country relationship** - Links to Caribbean countries for regional expansion
- **Contact information** - Primary/additional emails and phones, address, website
- **Operating hours** - Weekdays/weekends for each region
- **Sale terms and bidding instructions** - Bank-specific processes
- **View instructions** for potential buyers
- **Logo storage IDs** and allowed email domains for authorization
- **Slug-based URLs** for SEO-friendly bank pages

### Vehicle & Listing System
- **Simplified vehicle catalog** - Only essential fields (make, model, year) for consistency
- **Listing lifecycle management** - Draft → Active → Sold/Expired/Removed workflow
- **Multi-currency support** - Default JMD with expansion capability
- **Image optimization** - Separate cover image and gallery with storage ID management
- **Performance indexes** - Optimized for country-based filtering and search

### Market Analytics System
- **MarketStats table** - Stores median prices and sample sizes per vehicle/country
- **Real-time calculations** - Updates when listings change status
- **Price delta indicators** - Shows percentage difference from market median
- **Sample size validation** - Only shows stats when ≥5 similar vehicles exist
- **Country-specific analytics** - Separate market data per Caribbean country

### Caribbean Expansion Architecture
- **Countries table** - Jamaica active by default, Barbados/Trinidad ready for activation
- **Currency support** - JMD, BDS, TTD with country-specific defaults
- **Regional filtering** - Fast country-based search with denormalized data
- **Scalable authorization** - Email-based access control per bank per country
- **Market insights** - Pricing analytics to help buyers make informed decisions

This system allows multiple banks across the Caribbean to list repossessed vehicles with regional customization, optimal performance, and valuable market insights for buyers.