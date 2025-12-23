# **Browser Agent Test Management: Full Specification**

This document combines the Product Requirements Document (PRD) and the Technical Implementation Guide for the Browser Agent Test Management system.

## **Part 1: Product Requirements Document (PRD)**

### **1\. Project Overview**

The goal is to build a centralized repository and management interface for browser agent evaluations. This system will allow engineers to curate, categorize, and tag "test cases" (prompts and expected outcomes) to measure agent performance across different web domains and tool requirements.

### **2\. Core Data Model**

The database revolves around a Test entity. To ensure data integrity and ease of filtering, several fields rely on predefined taxonomies.

#### **2.1 The Test Object**

| Field | Type | Description |
| :---- | :---- | :---- |
| id | UUID | Unique identifier for the test case. |
| prompt | String | The natural language instruction given to the browser agent. |
| initial\_url | URL | The starting point for the agent (e.g., https://google.com). |
| golden | String | The expected "Ground Truth" answer or state description. |
| category | Enum/FK | High-level domain (e.g., *Travel, E-commerce, Productivity*). |
| sub\_category | Enum/FK | Specific domain (e.g., *Flight Booking* under *Travel*). |
| difficulty | Enum | simple or complex. |
| tool\_tags | List\<Enum\> | Multi-select list of required tools (e.g., Search, Click). |
| test\_sets | List\<String\> | Multi-select tags for grouping tests (e.g., v1-release). |
| created\_at | Timestamp | Auto-generated creation date. |
| updated\_at | Timestamp | Auto-generated last modified date. |

#### **2.2 Taxonomy Definitions (Editable)**

While these start with defaults, they are managed via the Settings interface:

* **Categories:** Search, Productivity, Social, Finance, E-commerce, News.  
* **Sub-Categories:** (Parent-child relationship to Categories)  
  * *E-commerce*: Checkout, Cart Management, Product Search.  
  * *Productivity*: Email, Calendar, Document Editing.  
* **Tool Tags:** Navigation, Text Entry, Element Interaction, File Upload, Captcha Solving, Authentication.

### **3\. User Interface Requirements**

The frontend is a single-page application (SPA) focused on high-density data management.

#### **3.1 The Dashboard (Main View)**

* **Table View:** Sortable, searchable table with row checkboxes for multi-selection.  
* **Global Search:** Search by prompt text or golden answer.  
* **Action Bar:** Buttons for "Add New Test", "Bulk Import (CSV)", and "Export to CSV".  
* **Sidebar Filters:** Multi-select filters for Category, Sub-category, Difficulty, Tool Tags, and Test Sets.

#### **3.2 Test Creation & Editing**

* **Form Interface:** A side-drawer or modal to create/edit tests.  
* **Update Logic:** System inherits existing values for unmodified fields and refreshes updated\_at.  
* **Validation:** URL validation for initial\_url and dynamic sub-category filtering based on selected category.

#### **3.3 Bulk Actions**

* **Selection:** Master checkbox for visible rows or individual row selection.  
* **Bulk-Edit Tags:** Append new tool\_tags or test\_sets to selected rows. Users can type a custom string to create and apply a new test set tag immediately.

#### **3.4 Exporting Data**

* **Filtered Export:** Exports current UI filtered state to CSV.  
* **Targeted Export:** Quick-actions to export specifically by test\_sets or tool\_tags.

#### **3.5 Bulk Import (CSV)**

* **Mapping:** Matches header rows to field names. If id exists, it updates; otherwise, it creates.  
* **Validation:** Checks incoming values against the current Taxonomy lists before processing.

#### **3.6 Taxonomy Management (Settings)**

* **Editor:** UI to add, rename, or delete Categories, Sub-categories, and Tool Tags.  
* **Constraint Handling:** Warns if a tag is in use before deletion and offers reassignment.

## **Part 2: Technical Implementation Guide**

To meet these requirements with a focus on speed-to-market and Vercel compatibility, the following "Vercel-Native" stack is recommended.

### **1\. Technology Stack**

* **Framework:** **Next.js 15 (App Router)** \- Optimized for Vercel with built-in API routes.  
* **Database:** **Supabase (PostgreSQL)** \- Managed Postgres that handles relational taxonomies and arrays effortlessly.  
* **ORM:** **Prisma** \- Provides a type-safe schema and simplifies relational management.  
* **UI Library:** **Shadcn/ui \+ Tailwind** \- High-quality, copy-paste components for Data Tables and Modals.  
* **State/Data:** **TanStack Query (v5)** \- Handles caching, filtering, and optimistic updates.

### **2\. Database Schema (Prisma)**

// schema.prisma

model Test {  
  id           String   @id @default(uuid())  
  prompt       String  
  initialUrl   String  
  golden       String  
  difficulty   String   // "simple" | "complex"  
    
  category     Category @relation(fields: \[categoryId\], references: \[id\])  
  categoryId   String  
  subCategory  SubCategory @relation(fields: \[subCategoryId\], references: \[id\])  
  subCategoryId String

  toolTags     String\[\]   
  testSets     String\[\]

  createdAt    DateTime @default(now())  
  updatedAt    DateTime @updatedAt  
}

model Category {  
  id           String        @id @default(cuid())  
  name         String        @unique  
  subCategories SubCategory\[\]  
  tests        Test\[\]  
}

model SubCategory {  
  id           String   @id @default(cuid())  
  name         String  
  category     Category @relation(fields: \[categoryId\], references: \[id\])  
  categoryId   String  
  tests        Test\[\]  
}

### **3\. Implementation Strategy**

* **Bulk Import:** Use papaparse on the client. Send JSON to a Next.js API route using Prisma upsert in a loop to handle the "Update or Create" logic.  
* **Bulk-Edit Tags:** Use Shadcn’s \<Checkbox /\> in the \<DataTable /\>. Use Postgres array\_append via Prisma to update multiple rows in a single database transaction.  
* **Exporting CSV:** Use json2csv on the client side. Since the filtered data is already in the TanStack Query cache, client-side generation is instantaneous.  
* **Taxonomy Management:** Build a "Settings" page. Implement a "Reassign or Delete" flow by checking prisma.test.count() for a specific taxonomy ID before allowing deletion.

## **Part 3: Future Phase Operations**

1. **Execution Integration:** A "Run Test" button to trigger the agent and log results.  
2. **Analytics:** Performance dashboard showing success rates per category or difficulty.