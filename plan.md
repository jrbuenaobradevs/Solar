# Cursor AI Prompt: Convert Solar All into Solar Mechanics

## Project Overview

Update the existing Solar All website codebase into **Solar Mechanics**, a professional solar energy, electrical services, and solar training website for the Philippine market.

The website will be associated with EEC Builders Corp. if the existing project already establishes that relationship.

The initial release must focus on solar supply and installation, including an interactive solar energy calculator that allows customers to estimate their solar requirements and submit a quotation request.

Electrical Services and Solar Training Center must have presentable informational pages with planned services, but their operational features will be implemented in future development phases.

**Important:** This is an update to an existing codebase, not a request to create an entirely new project from scratch.

---

## 1. Initial Instructions: Inspect Before Coding

Before making changes:

1. Inspect the entire existing project structure.
2. Identify the current frontend framework, backend framework, database, routing, styling system, reusable components, and deployment configuration.
3. Review the existing Home page, Solar All branding, solar calculator, pricing logic, quotation forms, and API endpoints.
4. Identify existing functional features that can be reused.
5. Check the current Git branch and working tree. Do not overwrite or discard uncommitted user changes.
6. Create a short implementation plan and then proceed with implementation.

### Technical constraints

- Preserve the existing technology stack and architectural conventions.
- Do not replace the framework or rewrite working modules without a demonstrated need.
- Reuse existing components, APIs, database models, and authentication mechanisms where appropriate.
- Follow the project's current naming conventions, linting rules, and formatting standards.
- If a backend or database already exists, extend it rather than introducing an unnecessary second backend.
- If an expected capability does not exist, implement the smallest compatible solution.
- Do not leave the project as a design mockup. Build working pages, navigation, calculator interactions, and quotation submission according to the existing architecture.

---

## 2. Rebrand Solar All to Solar Mechanics

Replace the existing Solar All branding with **Solar Mechanics** throughout the application.

Update the following:

- Website title and metadata
- Navigation bar and footer
- Logo references and branding assets
- Home page headings and content
- Solar package and calculator headings
- Buttons, labels, page titles, and form confirmations
- Mobile navigation
- Favicon and application icon, where applicable
- README or project documentation that references the old brand

Do not perform unsafe global text replacement that could change unrelated identifiers, database fields, API contracts, or internal variable names.

Use the latest Solar Mechanics logo supplied in the project or conversation, if it is accessible in the working environment. If the asset is not available locally, use a clearly defined logo asset path and a temporary, well-designed text-based logo rather than inventing a file path or embedding the entire branding mockup as the logo.

### Brand identity

Use this color palette:

- Electric Indigo: `#1606B8`
- Builder Blue: `#0755B5`
- Solar Red: `#F5444A`
- Cloud White: `#F5F8FC`
- Dark Navy for body text and contrast: `#17233B`

Typography:

- Montserrat for headings, titles, and prominent labels.
- Poppins for body text, descriptions, forms, and supporting UI.

Design direction:

- Professional engineering and renewable-energy aesthetic.
- White and light-gray backgrounds with indigo and blue accents.
- Red accents for primary actions and important highlights.
- Clean typography, generous spacing, rounded cards, and subtle shadows.
- Solar installation photography and technical illustrations where available.
- Consistent responsive layouts across desktop, tablet, and mobile.
- Accessible color contrast, visible focus indicators, semantic HTML, and keyboard-friendly controls.

Avoid excessive gradients, oversized decorative elements, generic dashboard styling on the public website, and unnecessary animations.

---

## 3. Main Navigation and Website Structure

Implement a responsive navigation bar with the following sections:

1. Home
2. Solar Solutions
3. Electrical Services
4. Solar Training Center
5. Projects, if supported by existing content
6. About Us
7. Contact Us
8. Get a Quote

Use appropriate dropdowns or grouped navigation only if they improve usability.

The primary conversion action should be **Get a Solar Quote**.

### Required pages

- `/` — Home
- `/solar-solutions` — Solar solutions, packages, and calculator entry point
- `/solar-calculator` — Optional dedicated calculator route if appropriate for the existing router
- `/electrical-services` — Informational electrical services page
- `/training-center` — Informational solar training page
- `/about` — Company overview
- `/contact` — Contact information and inquiry form, if supported
- `/quote` — Quotation workflow, or the equivalent existing route

Reuse existing routes when possible. Avoid duplicate pages if the project already has equivalent routes.

---

## 4. Home Page

Create a polished, conversion-focused landing page for Solar Mechanics.

### Hero section

Suggested headline:

**Powering a Cleaner, Brighter Tomorrow.**

Supporting text:

"Your partner in solar power solutions, electrical services, and practical solar training. Explore solar systems designed around your energy needs."

Primary button:
- Calculate Your Solar Needs

Secondary button:
- Explore Our Services

The primary button should open the solar calculator or navigate to the calculator section of Solar Solutions.

### Main services section

Show three distinct service cards.

#### Solar Solutions
Description: Solar system supply, installation, energy estimation, and customized quotations.

CTA: Explore Solar Solutions

#### Electrical Services
Description: Electrical supplies and installation solutions for residential, commercial, and industrial projects.

CTA: View Electrical Services

#### Solar Training Center
Description: Learn about solar photovoltaic systems, installation fundamentals, system sizing, and renewable-energy skills.

CTA: Explore Training

The latter two cards must link to their respective informational pages, even though their service workflows are not yet operational.

### Additional home page sections

- Featured solar packages, if existing approved pricing is available.
- Why choose Solar Mechanics.
- Overview of the solar estimation process.
- Selected projects or installation gallery, if real assets are available.
- Frequently asked questions.
- Contact or quotation CTA.
- Footer with service links and verified company contact information.

Do not invent company history, certifications, project statistics, customer testimonials, warranties, contact details, or claims of accreditation.

---

## 5. Solar Solutions Page

This is the primary functional section of the initial release.

Include:

- Introduction to residential and commercial solar solutions.
- Available solar system types.
- Solar packages and their inclusions, if actual product data exists.
- Solar calculator section or prominent calculator CTA.
- Explanation of the quotation process.
- Frequently asked questions.
- Request a Quote CTA.

### System types

Where supported by the existing business offerings, present:

- Hybrid solar systems
- On-grid solar systems
- Off-grid solar systems

Explain their differences accurately. Do not imply that every system provides backup power or operates during a grid outage.

For packages, display only prices and technical specifications supported by existing data or approved business inputs.

If official package prices are not available, create a reusable package component with clearly identified placeholder data for development, or display "Request a Quote" instead of inventing commercial prices.

---

## 6. Solar Energy Calculator

Implement a functional, customer-friendly calculator that helps visitors estimate their energy consumption and request a solar quotation.

The calculator must be integrated into the Solar Solutions experience. A separate route may also be provided if it improves usability.

### Step 1: Customer and property information

Collect the following:

- Customer name
- Email address
- Contact number
- Property type: Residential, Commercial, or Industrial
- City or municipality
- Province
- Optional project notes

Collect contact information at the appropriate stage. Allow customers to calculate their energy requirements before requiring them to submit personal information.

### Step 2: Appliance-based energy estimation

Provide a dynamic appliance list.

Each appliance entry should support:

- Appliance name
- Quantity
- Rated wattage in watts
- Estimated daily usage in hours
- Optional quantity or load notes

Include common examples such as:

- Air conditioner
- Refrigerator
- Electric fan
- Television
- Lighting
- Computer or laptop
- Washing machine
- Water pump
- Rice cooker
- Other/custom appliance

Allow customers to add, edit, and remove appliance rows.

Make wattage editable. Any suggested wattage must be labeled as an example because actual appliance ratings vary.

Validate quantities, wattage, and daily usage. Prevent negative values and usage hours greater than 24 per day.

### Step 3: Energy calculations

Calculate energy consumption per appliance:

`Daily energy (Wh) = Quantity × Wattage (W) × Daily usage hours`

Calculate total daily consumption:

`Total daily energy (kWh) = Sum of appliance daily Wh / 1000`

Calculate estimated monthly consumption:

`Monthly energy (kWh) = Daily energy (kWh) × 30`

Display:

- Total daily energy consumption in kWh.
- Estimated monthly energy consumption in kWh.
- Total connected appliance load in watts.
- Estimated solar PV capacity in kWp, when sufficient assumptions are available.
- Indicative system configuration, when supported.
- Estimated price or price range only when backed by approved package data or pricing rules.

### Step 4: Solar system sizing

The sizing logic must be modular, documented, and easy to replace with engineering-approved rules.

For an initial estimate, use:

`Estimated PV capacity (kWp) = Daily energy consumption (kWh) / (Peak sun hours × Performance factor)`

Peak sun hours and the performance factor must be configurable assumptions, not hardcoded claims about every Philippine location.

Use a clearly labeled default only if the existing application does not already provide approved assumptions.

Important limitations:

- This is a preliminary estimate, not a final engineering design.
- Connected appliance load does not equal actual energy consumption.
- Battery sizing must consider nighttime energy use, required backup duration, usable battery capacity, depth of discharge, and system losses.
- Inverter sizing must consider simultaneous loads, surge requirements, and applicable technical constraints.
- Solar production and savings estimates depend on location, roof orientation, shading, weather, tariffs, and system design.
- Do not promise guaranteed savings or continuous backup power.

If the existing project does not yet support reliable battery and inverter sizing, show these as items requiring technical assessment rather than presenting unsupported exact specifications.

### Step 5: System preference

Allow customers to indicate their preferred system:

- Hybrid
- On-grid
- Off-grid
- Not sure — recommend a suitable option

Collect additional requirements where useful:

- Battery backup required: Yes, No, or Not sure.
- Preferred backup duration, if applicable.
- Monthly electricity bill in PHP, optional.
- Existing solar installation: Yes or No.

Do not force customers to understand technical terms before they can complete the calculator.

### Step 6: Results summary

Display a clear summary card with:

- Daily energy demand.
- Estimated monthly energy demand.
- Total appliance load.
- Preliminary solar capacity estimate, when applicable.
- Selected system preference.
- Estimated package price, only if reliable pricing data is available.
- Important assumptions and limitations.

Provide the following actions:

- Edit Appliance List
- Recalculate
- Request a Quote

The UI should clearly distinguish calculated energy consumption from estimated system capacity and any preliminary price.

### Step 7: Request a Quote

When the customer selects "Request a Quote":

1. Preserve their calculated results.
2. Open a quotation form or navigate to the existing quote route.
3. Prefill the customer's calculation and system preference.
4. Collect the customer's contact details and project location.
5. Allow optional notes and installation requirements.
6. Validate required fields.
7. Submit the quotation to the existing backend if one is available.
8. Display a confirmation only after the server confirms successful submission.

The saved quotation should contain, where supported by the current architecture:

- Unique quotation reference.
- Customer details.
- Property type and project location.
- Appliance list and quantities.
- Total daily and monthly energy demand.
- Calculation assumptions and preliminary sizing results.
- Requested system type.
- Optional budget or electricity bill information.
- Customer notes.
- Submission timestamp.
- Status, initially "Pending Review".

If a backend is not available, implement the UI with a clearly documented development-only mock service and explain that requests are not persistently stored. Do not silently pretend that a quote was emailed or saved.

Prevent duplicate submissions and provide useful validation and server-error feedback.

---

## 7. Electrical Services — Informational Page Only

Implement a polished, responsive page that introduces the Electrical Services business category.

This page is intentionally not a functional booking, ordering, or service-management system.

### Suggested service plan cards

Use these as proposed service categories, not claims that all services are currently available:

1. Electrical Supply and Materials
2. Residential Electrical Installation
3. Commercial Electrical Installation
4. Lighting and Power Distribution
5. Electrical Maintenance and Troubleshooting
6. Project-Based Electrical Solutions

Each card should contain:

- Service title.
- Short description.
- Relevant icon or image.
- "Planned Service" or equivalent status when availability has not been confirmed.

Include a section titled "Future Service Offerings" or "Planned Services" to make the development status transparent.

A general Contact Us or Request Information button may lead to the existing contact page. Do not implement a service booking system, inventory checkout, payment flow, technician scheduling, or work-order management in this phase.

Do not represent regulated electrical work as available without confirmation that the company can offer it appropriately.

Build the service cards from structured data so additional categories can be added without rewriting the page.

---

## 8. Solar Training Center — Informational Page Only

Implement a professional landing page for the planned Solar Training Center.

This page is not yet a functional learning management system.

### Suggested training program cards

Use proposed course topics that can be revised later:

1. Introduction to Solar Photovoltaic Systems
2. Solar Panel Installation Fundamentals
3. Inverter and Battery System Fundamentals
4. Solar Energy Calculation and System Sizing
5. Solar System Maintenance and Troubleshooting
6. Solar Safety and Installation Best Practices

These are proposed topics only. Do not invent confirmed class schedules, course fees, training duration, certification outcomes, accreditation, instructor qualifications, or enrollment availability.

Each course card should support:

- Course title.
- Short description.
- Intended audience.
- Status: "Planned" or "Coming Soon".
- Optional "Register Interest" or "Contact Us" action.

If registration interest is enabled, connect it to an existing contact or inquiry endpoint only if one is available and appropriate. Otherwise, use a contact-page link.

Do not implement student accounts, lessons, quizzes, progress tracking, payment for courses, certificates, or an LMS in this initial phase.

Organize course information in structured data so future training programs can be added easily.

---

## 9. About Us and Contact

### About Us

Create a concise company introduction that positions Solar Mechanics around:

- Solar energy solutions.
- Electrical services.
- Renewable-energy education.

Use verified existing company information wherever available. Do not assume Solar Mechanics is legally a separate corporation or a registered subsidiary of EEC Builders Corp.

### Contact

Reuse the existing contact form and backend if available.

Use verified company details from the existing codebase. If an email address, telephone number, physical address, or social media link is missing, leave a clear editable placeholder or omit it rather than inventing contact information.

The main contact CTA should guide customers toward the solar quotation workflow.

---

## 10. Reusable Components and Maintainability

Create or refactor reusable components as appropriate for the current architecture.

Potential components include:

- `Navbar`
- `Footer`
- `HeroSection`
- `ServiceCard`
- `ServiceStatusBadge`
- `SolarPackageCard`
- `ApplianceRow`
- `SolarCalculatorForm`
- `SolarEstimateSummary`
- `QuoteRequestForm`
- `FAQSection`
- `ContactCTA`

Follow the existing framework's component naming conventions.

Keep the solar calculation logic separate from UI components. Use pure functions where possible and add unit tests for the main formulas and edge cases.

Keep Electrical Services and Training Center content in configuration objects or data files so new offerings can be added later.

Avoid unnecessary dependencies and do not create a complex content-management system solely to display static service plans.

---

## 11. Backend, Database, and API Integration

First determine what the current project already supports.

If a backend and database exist, reuse their conventions and extend the existing quote workflow.

If applicable, support the following operations through the existing API:

- Retrieve solar packages.
- Retrieve available system components.
- Submit a solar quotation.
- Retrieve approved pricing and calculator configuration.
- Validate and store quotation details.

Possible resource names include `/api/solar-packages` and `/api/quotes`, but follow the existing API naming conventions rather than introducing duplicate endpoints.

Backend requirements:

- Validate and sanitize customer inputs.
- Recalculate important totals on the server instead of trusting client-provided totals.
- Use the approved pricing source for any commercial price.
- Protect public submission endpoints with appropriate validation, rate limiting, and abuse prevention.
- Never expose credentials, API secrets, or private database connection strings in frontend code.
- Avoid collecting unnecessary personal information.
- Keep errors useful without exposing internal stack traces.

Do not implement payments, checkout, inventory purchasing, customer accounts, or complex admin workflows unless these already exist and are directly needed by the quotation process.

---

## 12. Responsive Design and User Experience

Test the website at common mobile, tablet, and desktop widths.

Requirements:

- Mobile-friendly navigation.
- Readable typography and appropriate spacing.
- Calculator rows that remain usable on narrow screens.
- Forms with labels, validation messages, and clear focus states.
- No horizontal overflow.
- Images with appropriate aspect ratios and optimized sizes.
- Loading, success, empty, and error states where applicable.
- Accessible semantic headings and form controls.
- Consistent button hierarchy and spacing.
- Clear visual distinction between functional solar features and future service plans.

Use existing assets when available. Do not generate fake project photos, fake customer testimonials, or fabricated business credentials.

---

## 13. Testing and Quality Assurance

Before declaring the implementation complete:

1. Run the project's available lint, type-check, and build commands.
2. Fix errors introduced by your changes.
3. Test all navigation links and page routes.
4. Test calculator behavior with zero appliances, multiple appliances, custom wattages, and boundary values.
5. Verify daily and monthly energy calculations.
6. Verify that the quotation form retains the calculation results.
7. Test required-field validation, server errors, and duplicate submission prevention.
8. Confirm that no fake success state appears when quotation submission fails.
9. Verify that Electrical Services and Training Center pages display planned offerings without implying functional service booking.
10. Confirm that the website is responsive on mobile, tablet, and desktop.
11. Ensure that the project builds successfully using its existing configuration.
12. Review changes for accidental removal of existing functionality.

Do not claim that tests passed unless they were actually executed.

---

## 14. Scope Boundaries

### Implement now

- Solar Mechanics branding.
- Responsive public website.
- Home page.
- Solar Solutions page.
- Functional appliance-based solar calculator.
- Preliminary solar system estimates with documented assumptions.
- Solar quotation request workflow.
- Electrical Services informational page with future-service plan cards.
- Solar Training Center informational page with proposed course cards.
- About Us and Contact pages, as supported by existing data.
- Reusable components and appropriate tests.

### Leave for future development

- Full electrical service booking and work-order management.
- Electrical inventory catalog and e-commerce checkout.
- Online payments.
- Full training registration and payment system.
- Learning management system, lessons, quizzes, and student accounts.
- Course certification and credential management.
- Customer accounts and quotation tracking portal.
- Complex CRM or ERP integrations.
- Advanced solar simulation using geographic, roof, weather, and utility-rate data.

Do not implement future functionality just because its placeholder appears on the website.

---

## 15. Final Deliverables

When finished, provide:

1. A concise summary of the implemented changes.
2. A list of files created, updated, or removed.
3. The final routes and navigation structure.
4. A description of the calculator formulas and assumptions.
5. An explanation of how quotation submissions are processed and stored.
6. A list of placeholder content or business information still requiring confirmation.
7. The actual test and build results.
8. Any environment variables or database migrations required.
9. Instructions for running the project locally.
10. A clear list of future features intentionally left unimplemented.

Start by inspecting the current codebase, then implement the initial Solar Mechanics website directly in the existing project. Prioritize a working, cohesive first release over unnecessary complexity.