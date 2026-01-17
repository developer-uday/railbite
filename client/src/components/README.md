# Components Structure

## Overview
Components are organized by feature/role to keep the codebase clean and maintainable as the project scales.

## Folder Structure

```
/components
├── /vendor          - Vendor Dashboard specific components
├── /user            - User Dashboard specific components (for future)
├── /common          - Shared/Common components (for future)
└── README.md
```

## /vendor Components

- **VendorHeader.jsx** - Top header with restaurant name, rating, and logout
- **StatsDashboard.jsx** - Stats cards (New Orders, Total Orders, Delivered, Revenue, Menu Items)
- **RestaurantInfoCard.jsx** - Restaurant details in compact card format
- **OrdersSection.jsx** - Orders container with filtering tabs
- **OrderCard.jsx** - Individual expandable order card
- **MenuManagement.jsx** - Menu section with add/edit form
- **MenuItemCard.jsx** - Individual menu item card with actions

## /user Components
Reserved for UserDashboard components (to be added)

## /common Components
For components shared between multiple roles/pages (to be added as needed)

## Guidelines

1. **Import Paths**: Always use relative paths from the component
   ```jsx
   import VendorHeader from "../components/vendor/VendorHeader";
   ```

2. **Props**: Keep components focused on single responsibility, pass all state handlers as props

3. **Reusability**: Extract common patterns to `/common` folder

4. **Naming**: Use descriptive PascalCase names that indicate the component's purpose

5. **Styling**: Use Tailwind CSS classes consistently
