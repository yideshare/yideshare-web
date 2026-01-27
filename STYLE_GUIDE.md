# YideShare Code Style Guide

This document defines coding standards and conventions for the YideShare project. All team members should follow these guidelines to ensure consistency, readability, and maintainability across the codebase.

---

## Table of Contents

1. [Indentation & Whitespace](#indentation--whitespace)
2. [Naming Conventions](#naming-conventions)
3. [Bracket Style](#bracket-style)
4. [Strings & Quotes](#strings--quotes)
5. [Comments](#comments)
6. [Function Declaration & Definition](#function-declaration--definition)
7. [Arrow Functions vs Named Functions](#arrow-functions-vs-named-functions)
8. [Async/Await](#asyncawait)
9. [Type Annotations](#type-annotations)
10. [Imports & Exports](#imports--exports)
11. [Props & Interface Definitions](#props--interface-definitions)
12. [Component Structure](#component-structure)
13. [Conditional Logic](#conditional-logic)
14. [Error Handling](#error-handling)
15. [File Organization](#file-organization)
16. [Spacing & Line Length](#spacing--line-length)
17. [Class & Object Literal Syntax](#class-syntax)
18. [API Routes & Server Actions](#api-routes--server-actions)
19. [Contributing](#contributing)
20. [Questions & Clarifications](#questions--clarifications)

---

## Indentation & Whitespace

### Rules

- **Use 2-space indentation** for all files (TypeScript, TSX, CSS, JSON, etc.)
- Never use tabs; configure your editor to use spaces
- Maintain consistent indentation for nested blocks

### Configuration

Add to your `.editorconfig` or VS Code `settings.json`:

```json
{
  "editor.indentSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false
}
```

---

## Naming Conventions

### Component Names (PascalCase)

- Use **PascalCase** for all React components
- File name must match the component name

```typescript
// CORRECT
// SearchBar.tsx
export function SearchBar() {
  return <input type="text" />;
}

// INCORRECT
// search-bar.tsx
export function search_bar() {
  return <input type="text" />;
}
```

### Function Names (camelCase)

- Use **camelCase** for function names
- Be descriptive about what the function does
- Prefix boolean-returning functions with `is`, `has`, `should`, `can`

```typescript
// CORRECT
export function calculateDistance(lat1: number, lat2: number) {
  // ...
}

export function isValidEmail(email: string): boolean {
  // ...
}

export function hasUserBookmarked(userId: string, rideId: string) {
  // ...
}

// INCORRECT
export function CalcDistance(lat1: number, lat2: number) {
  // ...
}

export function valid_email(email: string) {
  // ...
}

export function userBookmarked(userId: string, rideId: string) {
  // ...
}
```

### Variable Names (camelCase)

- Use **camelCase** for variables and constants
- Be descriptive; avoid single letters except for loop indices
- Use full words instead of abbreviations when possible

```typescript
// CORRECT
const userData = response.data;
const totalDistance = calculateDistance(startLat, endLat);
let currentRideIndex = 0;

for (let i = 0; i < rides.length; i++) {
  // Loop index 'i' is acceptable
}

// INCORRECT
const ud = response.data;
const td = calculateDistance(startLat, endLat);
const current_ride_index = 0;
```

### Interface & Type Names (PascalCase)

- Use **PascalCase** for interfaces, types, and enums
- Suffix component props with `Props`
- Suffix API response types with `Response`
- Suffix API request types with `Request`

```typescript
// CORRECT
interface User {
  id: string;
  name: string;
  email: string;
}

interface GetUserResponse {
  user: User;
  success: boolean;
}

interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

// INCORRECT
interface user {
  id: string;
}

type ride_data = {
  id: string;
};

interface SearchBarPropsType {
  placeholder: string;
}
```

### Constants (camelCase and UPPER_SNAKE_CASE)

- Use **camelCase** for regular constants
- Use **UPPER_SNAKE_CASE** only for environment-like constants

```typescript
// CORRECT
const defaultPageSize = 10;
const maxRetries = 3;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET;

// INCORRECT
const DEFAULT_PAGE_SIZE = 10;
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
```

### Database Field Names (camelCase)

- Use **camelCase** for database column names
- This applies to Prisma schema and all database interactions

```prisma
// CORRECT
model User {
  id          String    @id @default(cuid())
  firstName   String
  lastName    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// INCORRECT
model User {
  id          String    @id
  first_name  String
  last_name   String
  created_at  DateTime
}
```

### Private/Internal Functions

- Prefix private utility functions with underscore if not using classes
- In classes, use `private` keyword

```typescript
// CORRECT
export function publicFunction() {
  return _privateHelper();
}

function _privateHelper() {
  // Private implementation
}

// Or in classes:
class Utils {
  public static publicMethod() {
    return this.privateMethod();
  }

  private static privateMethod() {
    // ...
  }
}

// INCORRECT
export function publicFunction() {
  return helperFunction();
}

function helperFunction() {
  // ...
}
```

---

## Bracket Style

### Curly Braces

- Opening brace goes on the **same line** (K&R style for this project)
- Closing brace on its **own line**
- Always use braces, even for single-statement blocks
- Single line objects only acceptable for small objects

```typescript
// CORRECT
if (isValid) {
  processData();
} else {
  notifyUser();
}

function handleClick() {
  console.log("clicked");
}

const config = {
  debug: true,
  timeout: 5000,
};

const config = { debug: true, timeout: 5000 };

// INCORRECT
if (isValid) processData();

if (isValid) {
  processData();
} else {
  notifyUser();
}
```

### Parentheses

- No space between function name and opening parenthesis
- Space after keywords like `if`, `for`, `while`
- Space before opening brace in control structures

```typescript
// CORRECT
function myFunction(param: string) {
  if (condition) {
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}

// INCORRECT
function myFunction(param: string) {
  if (condition) {
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}
```

---

## Strings & Quotes

### Double Quotes

- Use **double quotes** `"` for all strings
- Exception: Template literals use backticks

```typescript
// CORRECT
const message = "Hello, World!";
const greeting = `Hello, ${name}!`;

// INCORRECT
const message = "Hello, World!";
```

### Template Literals

- Use template literals for interpolation
- Prefer template literals over string concatenation for readability

```typescript
// CORRECT
const greeting = `Hello, ${user.name}!`;
const error = `Failed to fetch user ${userId}: ${errorMessage}`;

// INCORRECT
const greeting = "Hello, " + user.name + "!";
const error = `Failed to fetch user ` + userId + `: ` + errorMessage;
```

### Multi-line Strings

- Use template literals for multi-line strings
- Keep formatting consistent

```typescript
// CORRECT
const instructions = `
  1. Enter your departure location
  2. Enter your destination
  3. Select a date and time
  4. Review and confirm
`;

// INCORRECT
const instructions =
  "1. Enter your departure location\n" +
  "2. Enter your destination\n" +
  "3. Select a date and time\n" +
  "4. Review and confirm";
```

---

## Comments

### Single-Line Comments

- Use `//` followed by one space for single-line comments
- Comment should explain the "why", not the "what"
- Do not use periods; a single line comment should be short

```typescript
// CORRECT
// Calculate distance using Haversine formula
const distance = calculateHaversine(lat1, lat2);

// Initialize default config for development environment
const config = getDefaultConfig();

// INCORRECT
//set the distance.
const distance = calculateDistance(lat1, lat2);

//config
const config = getDefaultConfig();
```

### Multi-Line Comments

- Use `/* */` for multi-line comments
- Each line inside the comment should start with `*` and be properly aligned

```typescript
// CORRECT
/*
 * This function handles user authentication by validating
 * the JWT token and checking against the database.
 * Returns null if token is invalid or expired.
 */
export function validateUserAuth(token: string) {
  // ...
}

// INCORRECT
/*
This function handles user authentication
by validating the JWT token
*/
export function validateUserAuth(token: string) {
  // ...
}
```

### JSDoc Comments

- Use JSDoc for public functions and components
- Include `@param`, `@returns`, and `@throws` when applicable
- Provide description, not just types (types are in the signature)

```typescript
// CORRECT
/**
 * Calculates the distance between two geographic coordinates.
 *
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // ...
}

/**
 * Fetches user data from the API.
 *
 * @param userId - The ID of the user to fetch
 * @returns User data or null if not found
 * @throws Error if network request fails
 */
export async function fetchUser(userId: string): Promise<User | null> {
  // ...
}

// INCORRECT
/**
 * @param lat1 latitude
 * @param lon1 longitude
 * @param lat2 latitude
 * @param lon2 longitude
 * @returns number
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // ...
}
```

### TODO, FIXME, HACK Comments

- Use standard prefixes: `TODO`, `FIXME`, `HACK`
- Include a brief description
- Consider including the author or date for context

```typescript
// CORRECT
// TODO: Implement pagination for large result sets
export function loadAllRides() {
  // ...
}

// FIXME: This search query is inefficient, needs index optimization
const rides = await db.ride.findMany({
  where: { destination: query },
});

// HACK: Temporary workaround for timezone issue, remove after upgrading to Node 18+
const localTime = new Date(dateString + " GMT");

// INCORRECT
// need to do this later
export function loadAllRides() {
  // ...
}

// bad search
const rides = await db.ride.findMany({
  where: { destination: query },
});
```

### Comment Section Dividers

- Use comment dividers to organize large files
- Format: `// ------- SECTION NAME -------`

```typescript
// CORRECT
// ------- TYPES -------
interface RideData {
  id: string;
  distance: number;
}

// ------- UTILITIES -------
function calculateDistance() {
  // ...
}

// ------- COMPONENT -------
export function RideCard() {
  // ...
}

// INCORRECT
// TYPES
interface RideData {
  // ...
}

// types
interface RideData {
  // ...
}
```

### No Unnecessary Comments

- Remove comments that explain obvious code
- Code should be self-documenting

```typescript
// CORRECT
const validatedEmail = validateEmail(email);

// INCORRECT
// Validate the email
const validatedEmail = validateEmail(email);

// Set count to 0
let count = 0;
```

---

## Function Declaration & Definition

### Named Function Declarations

- Use function declarations for reusable functions and when hoisting is beneficial
- Use arrow functions for callbacks and shorter functions

```typescript
// CORRECT - Named function for utilities
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Implementation
}

// Callback function with arrow function
const rides = allRides.filter((ride) => ride.distance < 10);

// INCORRECT
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  // Implementation
};
```

### Function Parameters

- Put each parameter on its own line if the parameter list is long
- Keep related parameters together

```typescript
// CORRECT
// Short parameter list
function getUserData(userId: string, includeDetails: boolean) {
  // ...
}

// Long parameter list
export async function createRide(
  departure: string,
  destination: string,
  departureTime: Date,
  maxPassengers: number,
  notes?: string,
): Promise<Ride> {
  // ...
}

// INCORRECT
// Same line is okay for short lists
function getUserData(userId: string, includeDetails: boolean) {
  // ...
}

// Too long on one line
export async function createRide(
  departure: string,
  destination: string,
  departureTime: Date,
  maxPassengers: number,
): Promise<Ride> {
  // ...
}
```

### Return Types

- Always specify return types for public functions
- Omit return types for arrow functions with obvious types only if it's unambiguous

```typescript
// CORRECT
export function getUserData(userId: string): User | null {
  // ...
}

export async function fetchRides(limit: number): Promise<Ride[]> {
  // ...
}

// Internal functions can be more flexible
function _calculateAge(birthDate: Date) {
  // Return type inferred: number
  return new Date().getFullYear() - birthDate.getFullYear();
}

// INCORRECT
// Missing return type
export function getUserData(userId: string) {}
```

### Arrow Functions in React Components

- Use arrow functions for event handlers and callbacks
- Keep them concise for simple operations

```typescript
// CORRECT
export function SearchBar() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}

// INCORRECT
export function SearchBar() {
  function handleSearch(query: string) {
    console.log("Searching for:", query);
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

---

## Arrow Functions vs Named Functions

### Use Named Functions For:

- Public/exported functions
- Functions with multiple statements
- Functions that are referenced before definition

### Use Arrow Functions For:

- Callbacks and event handlers
- Short, single-expression functions
- Array methods (.map, .filter, etc.)

```typescript
// ✓ CORRECT
export function calculateDistance(lat1: number, lat2: number): number {
  // Named function for public API
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  // ...
  return distance;
}

const rides = allRides.map((ride) => ({
  ...ride,
  distance: calculateDistance(ride.lat1, ride.lat2),
}));

const handleClick = () => {
  setIsOpen(!isOpen);
};
```

---

## Async/Await

### Async Function Declaration

- Use `async`/`await` instead of `.then()` chains
- Always specify return type for async functions

```typescript
// CORRECT
export async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}

// INCORRECT
export function fetchUserData(userId: string) {
  return fetch(`/api/users/${userId}`).then((res) => res.json());
}

export async function fetchUserData(userId: string) {
  // Missing return type
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}
```

### Promise Resolution

- Use `await` for sequential operations
- Use `Promise.all()` for parallel operations
- Handle all promises returned

```typescript
// CORRECT - Sequential when needed
export async function processRideCreation(rideData: RideData) {
  const user = await validateUser(rideData.userId);
  const ride = await createRide(user.id, rideData);
  await notifyUser(user.email, ride);
  return ride;
}

// Parallel when operations are independent
export async function fetchRideDetails(rideId: string) {
  const [ride, reviews, bookmarks] = await Promise.all([
    getRide(rideId),
    getReviews(rideId),
    getBookmarks(rideId),
  ]);
  return { ride, reviews, bookmarks };
}

// INCORRECT - Missing await on Promise.all
export async function fetchRideDetails(rideId: string) {
  const [ride, reviews] = Promise.all([getRide(rideId), getReviews(rideId)]);
  // Missing await - returns Promise[]
}
```

---

## Type Annotations

### Variable Type Annotations

- Omit type annotations when TypeScript can infer the type
- Include type annotations for function parameters and return types
- Include type annotations for exported variables and constants

```typescript
// CORRECT
// Inference is clear
const count = 0; // number
const user = await fetchUser(id); // User

// Explicit types for clarity or when inference isn't obvious
const rides: Ride[] = [];
const config: Record<string, unknown> = JSON.parse(configJson);

// Function parameters always need types
export function validateEmail(email: string): boolean {
  // ...
}

// INCORRECT
const count: number = 0; // Unnecessary
const user: User = await fetchUser(id); // Unnecessary

// Missing parameter type
export function validateEmail(email) {}
```

### Using `any`

- Avoid `any`
- If absolutely necessary, use `unknown` instead and add proper type guards
- Document why `any` is necessary if used

```typescript
// CORRECT
// Type guard for unknown
function processPayload(payload: unknown): string | null {
  if (typeof payload === "object" && payload !== null && "netId" in payload) {
    return (payload as { netId: string }).netId;
  }
  return null;
}

// Or use generic type
function processData<T extends { id: string }>(data: T): string {
  return data.id;
}

// INCORRECT
function processPayload(payload: any): string | null {
  return payload?.netId ?? null;
}

const data: any = JSON.parse(json);
```

### Union Types

- Use union types for parameters that can be multiple types
- Keep union types readable; break into multiple lines if necessary

```typescript
// CORRECT
export function formatValue(value: string | number | null): string {
  // ...
}

export function processData(
  data: User | Ride | null,
  options: Record<string, unknown>,
): Result {
  // ...
}

// INCORRECT
// Too many types on the same line
export function formatValue(value: string | number | null | bool) {
  // ...
}
```

### Optional Types

- Use `?` for optional properties
- Use union with `undefined` or `null` for optional parameters
- Be explicit about what null/undefined means

```typescript
// CORRECT
interface User {
  id: string;
  name: string;
  email?: string; // Optional property
}

export function getUserData(userId: string, includeEmail?: boolean) {
  // ...
}

// INCORRECT
interface User {
  id: string;
  name: string;
  email: string | null; // Use ? instead for properties
}
```

### Generics

- Use clear, descriptive names for generic types (not just `T`, `U`, `V`)
- Include constraints when appropriate

```typescript
// CORRECT
export function transformArray<Item>(items: Item[]): Item[] {
  // ...
}

export function cache<Data extends { id: string }>(key: string, data: Data) {
  // ...
}

// INCORRECT
export function transformArray<T>(items: T[]): T[] {
  // ...
}

export function cache<T>(key: string, data: T) {
  // ...
}
```

---

## Imports & Exports

### Import Organization

Group imports in the following order with blank lines between groups:

1. React/Next.js imports
2. Third-party library imports
3. Internal utility imports
4. Internal component imports
5. Type imports

```typescript
// CORRECT
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { clsx } from "clsx";
import { format } from "date-fns";

import { cn } from "@/lib/frontend";
import { calculateDistance } from "@/lib/ride";

import { SearchBar } from "@/components/search";
import { FeedRideCard } from "@/components/feed";

import type { User } from "@/app/interface/main";
import type { RideData } from "@/lib/ride";

// INCORRECT
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import type { User } from "@/app/interface/main";
import { clsx } from "clsx";
import { cn } from "@/lib/frontend";
```

### Path Aliases

- Always use path aliases (`@/`) instead of relative imports
- This makes refactoring easier and improves readability
- Use relative paths only when creating an `index.ts` file to organize lower level imports

```typescript
// CORRECT
import { cn } from "@/lib/frontend";
import { SearchBar } from "@/components/search-bar";
import type { User } from "@/app/interface/main";

// INCORRECT
import { cn } from "../../lib/frontend";
import { SearchBar } from "../../components/search-bar";
import type { User } from "../interface/main";
```

### Barrel Exports

- Use index files for exporting multiple related items
- Don't create barrel exports for single items

```typescript
// CORRECT
// components/ui/index.ts
export { Button } from "./button";
export { Card } from "./card";
export { Input } from "./input";
export type { ButtonProps } from "./button";

// Usage
import { Button, Card } from "@/components/ui";

// INCORRECT
// Just import directly from the file
// components/index.ts
export { SearchBar } from "./search-bar";
```

### Named vs Default Exports

- Use **named exports** for utilities, hooks, and functions
- Use **default exports** for page components and client components

```typescript
// CORRECT
// utils.ts
export function calculateDistance() {
  // ...
}

// page.tsx
export default function Home() {
  return <div>Home</div>;
}

// feedClient.tsx
("use client");

export default function FeedPageClient() {
  return <div>Feed</div>;
}
```

### Type Imports

- Use `import type` for type-only imports

```typescript
// CORRECT
import type { User, Ride } from "@/app/interface/main";
import { getUserData } from "@/lib/user";

// INCORRECT
import { User, Ride, getUserData } from "@/app/interface/main";
```

---

## Props & Interface Definitions

### Props Interface Naming

- Suffix with `Props`
- Place right before component definition if used once
- Place in `interface/main.ts` if used multiple times
- Include JSDoc for complex props

```typescript
// CORRECT
interface RideCardProps {
  ride: Ride;
  isBookmarked: boolean;
  onBookmark: (rideId: string) => void;
  onDelete?: (rideId: string) => void;
}

/**
 * Displays a single ride in the feed.
 * Shows ride details and allows user interactions like bookmarking.
 */
export function RideCard({
  ride,
  isBookmarked,
  onBookmark,
  onDelete,
}: RideCardProps) {
  // ...
}

// INCORRECT
interface RideCardPropsType {
  // Wrong naming
}

export interface IrideCard {
  // Don't prefix with I
}

export function RideCard(props: { ride: Ride; isBookmarked: boolean }) {
  // Props defined inline instead of interface
}
```

### Destructuring Props

- Destructure props in the component signature
- This makes dependencies clear and is easier to refactor

```typescript
// CORRECT
export function RideCard({ ride, isBookmarked, onBookmark }: RideCardProps) {
  return <div>{ride.destination}</div>;
}

// INCORRECT
export function RideCard(props: RideCardProps) {
  return <div>{props.ride.destination}</div>;
}
```

### Optional Props

- Mark optional props with `?`
- Provide default values or handle undefined

```typescript
// CORRECT
interface RideCardProps {
  ride: Ride;
  onSelect?: (rideId: string) => void;
  variant?: "compact" | "full";
}

export function RideCard({ ride, onSelect, variant = "full" }: RideCardProps) {
  return (
    <div>
      {variant === "full" && <p>{ride.description}</p>}
      {onSelect && <button onClick={() => onSelect(ride.id)}>Select</button>}
    </div>
  );
}

// INCORRECT
interface RideCardProps {
  ride: Ride;
  onSelect: ((rideId: string) => void) | null;
  variant: "compact" | "full" | null;
}
```

---

## Component Structure

### Component Definition Order

1. Imports
2. Type/Interface definitions
3. Component declaration
4. Hooks and state
5. Event handlers
6. Effects
7. JSX/Return statement
8. Export

```typescript
// CORRECT
import { useState } from "react";
import { cn } from "@/lib/frontend";

interface RideCardProps {
  ride: Ride;
  onSelect: (rideId: string) => void;
}

export function RideCard({ ride, onSelect }: RideCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect(ride.id);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{ride.destination}</h3>
      <button onClick={handleClick}>Select</button>
    </div>
  );
}
```

### Server vs Client Components

- Use `"use client"` directive at the top of files that need client-side features
- Prefer server components for data fetching
- Keep client components focused on interactivity

### Component Naming

- Name components based on their purpose, not structure
- Use descriptive names over generic ones

```typescript
// CORRECT
export function RideSearchBar() {}
export function FeedHeader() {}
export function BookmarkButton() {}

// INCORRECT
export function SearchBar() {} // Too generic
export function Header() {} // Too generic
```

---

## Conditional Logic

### If-Else Statements

- Use braces even for single statements
- Keep conditions readable
- Use early returns to reduce nesting

```typescript
// CORRECT
if (!ride.id) {
  throw new Error("Ride ID is required");
}

if (ride.status === "cancelled") {
  console.log("Ride is cancelled");
  return;
}

// INCORRECT
if (!ride.id) throw new Error("Ride ID is required");

if (ride.status === "cancelled") console.log("Ride is cancelled");
else updateRideStatus(ride.id, "active");
```

### Ternary Operators

- Use ternaries for simple, readable conditions
- Avoid nested ternaries; use if-else instead

```typescript
// CORRECT
const status = ride.isActive ? "Active" : "Inactive";
const className = cn("base", isHovered && "hovered");

// INCORRECT
const status = ride.isActive
  ? "Active"
  : ride.isCancelled
    ? "Cancelled"
    : "Completed";

// Better as if-else
let status: string;
if (ride.isActive) {
  status = "Active";
} else if (ride.isCancelled) {
  status = "Cancelled";
} else {
  status = "Completed";
}
```

---

## Error Handling

### Try-Catch Blocks

- Always catch errors with proper typing
- Do not **ever** use empty catch blocks
- Log or handle errors appropriately

```typescript
// CORRECT
try {
  const user = await fetchUser(userId);
  return user;
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("Network failed:", error.message);
    throw new Error("Failed to fetch user. Please check your connection.");
  }
  console.error("Unexpected error:", error);
  throw error;
}

// INCORRECT
try {
  const user = await fetchUser(userId);
  return user;
} catch {
  // Silent failure
}

try {
  const user = await fetchUser(userId);
  return user;
} catch (error) {
  // No handling
}
```

### Error Type Handling

- Create custom error types for specific error scenarios
- Handle different error types appropriately

```typescript
// CORRECT
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

async function validateAndFetch(id: string) {
  if (!id) {
    throw new ValidationError("ID is required");
  }

  try {
    return await fetch(`/api/users/${id}`);
  } catch (error) {
    throw new NetworkError("Failed to fetch user");
  }
}

// INCORRECT
async function validateAndFetch(id: string) {
  try {
    if (!id) {
      throw "ID is required"; // Don't throw strings
    }
    return await fetch(`/api/users/${id}`);
  } catch (error) {
    throw error; // Don't re-throw without handling
  }
}
```

### Validation

- Validate inputs at function entry points
- Return meaningful error messages

```typescript
// CORRECT
export function validateEmail(email: string): boolean {
  if (!email) {
    throw new ValidationError("Email is required");
  }
  if (!email.includes("@")) {
    throw new ValidationError("Invalid email format");
  }
  return true;
}
```

---

## File Organization

### File Naming

- Component files: **PascalCase** (e.g., `SearchBar.tsx`, `RideCard.tsx`)
- Utility files: **camelCase** (e.g., `user.ts`, `ride.ts`, `validate.ts`)
- Page files: **lowercase** (e.g., `page.tsx`, `layout.tsx`) Next.js convention
- Index files: use `index.ts` when exporting multiple items from a directory

```
components/
  SearchBar.tsx
  RideCard.tsx
  FeedRideCard.tsx

lib/
  user.ts
  ride.ts
  validate.ts

app/
  page.tsx
  layout.tsx
  feed/
    page.tsx
```

### File Size

- Keep files under 300 lines of code
- Extract large components into smaller subcomponents
- Extract large functions into separate utility files

---

## Spacing & Line Length

### Maximum Line Length

- Aim for **80-100 characters** per line
- Hard limit of **120 characters** for code (can be longer for URLs, long strings)
- Long lines are acceptable for configuration and JSX with proper indentation

### Blank Lines Between Sections

- Use blank lines to separate logical sections
- One blank line between function definitions
- Two blank lines between major sections (types, utilities, component)

```typescript
// CORRECT
import { useState } from "react";
import { cn } from "@/lib/frontend";

interface RideCardProps {
  ride: Ride;
  onSelect: (rideId: string) => void;
}

export function RideCard({ ride, onSelect }: RideCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect(ride.id);
  };

  return (
    <div onClick={handleClick} onMouseEnter={() => setIsHovered(true)}>
      {ride.destination}
    </div>
  );
}

export function RideList({ rides }: { rides: Ride[] }) {
  return (
    <div>
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} onSelect={() => {}} />
      ))}
    </div>
  );
}
```

### Object & Array Formatting

- Single-line for simple objects/arrays
- Multi-line for complex structures

```typescript
// CORRECT
const config = { debug: true, timeout: 5000 };
const tags = ["react", "typescript"];

// Complex
const rideData = {
  id: ride.id,
  departure: ride.departure,
  destination: ride.destination,
  departureTime: ride.departureTime,
  passengers: ride.passengers.map((p) => p.id),
};
```

---

## Class Syntax

- Use `class` keyword for complex objects with methods
- Use `private`, `public` keywords explicitly
- Constructors should be concise

```typescript
// CORRECT
export class RideManager {
  private rides: Ride[] = [];
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  public addRide(ride: Ride): void {
    this.rides.push(ride);
  }

  public getRides(): Ride[] {
    return this.rides;
  }

  private _validateRide(ride: Ride): boolean {
    // Internal validation
    return ride.id !== "";
  }
}

// INCORRECT
export class RideManager {
  rides: Ride[] = [];
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.rides = [];
  }
}
```

---

## API Routes & Server Actions

### API Route Naming

- Use lowercase with hyphens for route files
- Create a subdirectory for each resource/action

```
app/api/
  auth/
    login/
      route.ts
    logout/
      route.ts
  rides/
    create/
      route.ts
    [id]/
      route.ts
```

### Route Handler Structure

- Specify supported HTTP methods
- Validate input
- Return typed responses
- Include error handling

```typescript
// CORRECT - app/api/rides/create/route.ts
import { NextRequest, NextResponse } from "next/server";

interface CreateRideRequest {
  departure: string;
  destination: string;
  departureTime: string;
}

interface CreateRideResponse {
  success: boolean;
  data?: { id: string };
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CreateRideResponse>> {
  try {
    const body = (await request.json()) as CreateRideRequest;

    // Validate input
    if (!body.departure || !body.destination) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create ride
    const ride = await createRideInDb(body);

    return NextResponse.json({ success: true, data: { id: ride.id } });
  } catch (error) {
    console.error("Failed to create ride:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// INCORRECT
export async function POST(request: NextRequest) {
  const body = await request.json();
  const ride = await createRideInDb(body); // No validation
  return NextResponse.json({ id: ride.id }); // No error handling
}
```

### Server Actions

- Keep server actions focused on a single task
- Include proper error handling and validation
- Return typed responses

```typescript
// CORRECT
"use server";

export async function createBookmark(
  rideId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (!rideId) {
      return { success: false, error: "Ride ID is required" };
    }

    await db.bookmark.create({
      data: { userId: session.user.id, rideId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return { success: false, error: "Failed to create bookmark" };
  }
}
```

---

## Contributing

### Pull Requests

All code changes require a pull request review before merging to maintain code quality and consistency.

- Target the `main` branch
- Write a clear, descriptive title summarizing the changes
- Explain what was done and why in the summary
- Link related issues with keywords: `Closes #123`, `Fixes #456`, `Relates to #789`
- Specify the type of change (Feature, Bug Fix, Refactor, Performance, etc.)
- List main contributors if multiple people worked on the PR
- Include screenshots or recordings for UI changes
- Assign at least one reviewer before merging

### PR Review Process

- Require at least one approval before merging
- Address all feedback before re-requesting review
- Keep PRs focused on a single concern; split large changes into multiple PRs if needed
- Highlight areas that need special reviewer attention

### Conventional Commits

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format for clear, semantic commit history.

```
<type>[optional scope]: <subject>

[optional body]

[optional footer(s)]
```

Type specifies the kind of change:

- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code change that improves structure (non-breaking)
- `perf`: Performance improvement
- `docs`: Documentation only
- `style`: Formatting changes (no behavior changes)
- `test`: Adding or updating tests
- `chore`: Build, CI, dependencies, or other non-code changes

Scope specifies what part of the codebase is affected. Add `!` after the scope to indicate a breaking change.

Subject describes what changed:

- Start with lowercase
- Use imperative mood: "add" not "added" or "adds"
- No period at end
- Limit to 50 characters
- Be specific and descriptive

Body explains what and why. Footer references related issues, reviewers, and breaking changes.

```
// CORRECT
// Simple fix
fix(bookmarks): remove duplicate bookmark entries

// Feature with scope
feat(feed): add ride sorting by departure time

// Refactor with body
refactor(utils): extract validation logic into separate module

Previously validation was scattered across route handlers.
Consolidating improves maintainability and testability.

Relates to #234

// Breaking change
feat(api)!: require authentication for all endpoints

All API endpoints now require a valid JWT token in the Authorization header.

BREAKING CHANGE: Unauthenticated requests will receive 401 Unauthorized
```

---

## Summary Checklist

Before committing code, verify:

**Code Quality:**

- [ ] **Indentation**: 2 spaces, no tabs
- [ ] **Naming**: PascalCase for components/types, camelCase for functions/variables
- [ ] **Brackets**: Correct placement, always used
- [ ] **Comments**: Meaningful, explain "why" not "what", use JSDoc for public functions
- [ ] **Imports**: Organized in groups, using path aliases
- [ ] **Quotes**: Double quotes for strings, backticks for templates
- [ ] **Types**: TypeScript strict mode, no `any`, specify return types
- [ ] **Error Handling**: Use try-catch, validation on inputs
- [ ] **Async**: Return types on async functions, use await properly
- [ ] **Components**: Logical structure, server vs client separated
- [ ] **Props**: Interfaces defined, destructured in signature
- [ ] **Line Length**: Under 100 characters where possible
- [ ] **No Dead Code**: Remove unused functions, imports, files
- [ ] **File Organization**: Logical structure, reasonable file size

**Before Committing:**

- [ ] Commit message follows conventional commits format
- [ ] Changes are logically grouped into a single concern
- [ ] No debug code or commented-out code remains

**Before Creating a Pull Request:**

- [ ] Tests are added or updated
- [ ] Documentation is updated (if needed)
- [ ] All CI/CD checks pass locally
- [ ] At least one reviewer assigned
- [ ] PR summary clearly describes the changes and why
- [ ] Related issues are referenced
- [ ] All conversations on previous feedback are resolved

---

## Questions & Clarifications

For questions about applying this style guide:

1. Check the relevant section above
2. Look for the "CORRECT" example
3. If still unclear, ask the team lead

Last Updated: January 2026