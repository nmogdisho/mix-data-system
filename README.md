# ConcreteMix Pro - Data Management System

A professional-grade React application for managing concrete mix data with Supabase backend integration.

## Features

- **Authentication**: Secure user authentication with Supabase
- **Mix Data Entry**: Dynamic forms for different concrete mix types (interlock, boards/tiir)
- **Data Management**: View, filter, sort, and export mix data records
- **Real-time Validation**: Form validation with Zod schemas
- **Responsive Design**: Optimized for mobile and desktop devices
- **Export Functionality**: Export data to CSV format
- **Role-based Access**: User-specific data access with RLS

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the database migrations in your Supabase project:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/create_mix_data_table.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Schema

The application uses a single `mix_data` table with the following structure:

```sql
CREATE TABLE mix_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  mixType text NOT NULL CHECK (mixType IN ('interlock', 'boards/tiir')),
  measurements jsonb NOT NULL,
  createdBy uuid REFERENCES auth.users(id) NOT NULL,
  lastModified timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

The `measurements` JSONB field contains:
- `cement` (number)
- `aggregate` (number)
- `sand` (number)
- `water` (number)
- `plastizer` (number)
- `totalProducts` (number)
- `birta` (number, optional - only for boards/tiir type)

## Usage

### Mix Entry
1. Navigate to the Mix Entry page
2. Select your concrete mix type (interlock or boards/tiir)
3. Enter measurement values for each component
4. Submit the form to save the data

### Data View
1. Navigate to the Data View page
2. Use filters to search and filter data by mix type
3. Sort columns by clicking headers
4. Export data using the Export CSV button
5. Edit or delete records using the action buttons

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- All API endpoints are protected with authentication
- Input validation on both client and server side

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.