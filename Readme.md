# AssetFlow — Enterprise Asset & Resource Management System

## Overview

AssetFlow is a centralized ERP platform for tracking, allocating, and maintaining physical assets and shared resources. It replaces spreadsheets and paper logs with structured asset lifecycles, conflict-safe resource booking, and real-time operational visibility.

The platform is industry-agnostic — any organization with equipment, furniture, vehicles, or shared spaces (offices, schools, hospitals, factories, agencies) can use it. AssetFlow focuses purely on asset and resource management; it does not handle purchasing, invoicing, or accounting.

## Problem Statement

Organizations struggle to track who holds which asset, where it is, and its condition. Manual processes lead to:

- Double-allocation of assets with no conflict detection
- Overlapping bookings of shared resources
- Untracked or delayed maintenance
- No structured audit trail for asset verification
- Missed overdue returns and bookings

AssetFlow solves this with a role-based ERP system built around explicit lifecycles, approval workflows, and automated conflict validation.

## Core Features

### Identity & Organization Setup

- Employee-only signup — no self-assigned roles
- Admin-only promotion of Employees to Department Head or Asset Manager (via Employee Directory only)
- Department management with hierarchy (parent/child departments)
- Asset category management with optional category-specific fields
- Employee directory with department, role, and status tracking

### Asset Registry

- Asset registration with auto-generated Asset Tag, serial number, acquisition details, condition, location, and photos/documents
- Search and filter by tag, serial number, QR code, category, status, department, or location
- Full asset lifecycle: **Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed**, with enforced valid state transitions
- Per-asset history: allocation history + maintenance history

### Allocation & Transfer

- Allocate assets to employees or departments with optional expected return date
- **Conflict handling**: an already-allocated asset cannot be re-allocated — the requester is shown who currently holds it and offered a Transfer Request instead
- Transfer workflow: Requested → Approved → Re-allocated, with automatic history updates
- Return flow with condition check-in notes; asset reverts to Available
- Automatic overdue detection for allocations past their expected return date

### Resource Booking

- Calendar view of a resource's existing bookings
- **Overlap validation**: bookings that overlap an existing time slot are rejected automatically; adjacent bookings are allowed
- Booking status: Upcoming, Ongoing, Completed, Cancelled
- Cancel/reschedule support with reminder notifications before a slot starts

### Maintenance Management

- Raise maintenance requests with issue description, priority, and photo attachment
- Approval workflow: Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved
- Asset status auto-updates to Under Maintenance on approval and back to Available on resolution
- Maintenance history retained per asset

### Asset Audit

- Create audit cycles scoped by department/location and date range
- Assign one or more auditors per cycle
- Auditors mark each asset as Verified, Missing, or Damaged
- Auto-generated discrepancy reports for flagged items
- Closing a cycle locks it and updates affected asset statuses (e.g., confirmed-missing assets marked Lost)
- Full audit history retained per cycle

### Reports & Analytics

- Asset utilization trends — most-used vs. idle assets
- Maintenance frequency by asset/category
- Assets due for maintenance or nearing retirement
- Department-wise allocation summary
- Resource booking heatmap (peak usage windows)
- Exportable reports

### Activity Logs & Notifications

- Notifications for asset assignment, maintenance approval/rejection, booking confirmation/cancellation/reminders, transfer approval, overdue alerts, and audit discrepancies
- Full audit log of admin/manager/employee actions — who did what, and when

## User Roles

| Role                | Responsibilities                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**           | Manages departments, asset categories, audit cycles, and role assignment; views organization-wide analytics                                 |
| **Asset Manager**   | Registers and allocates assets; approves transfers, maintenance requests, audit discrepancy resolution, and returns                         |
| **Department Head** | Views department's allocated assets; approves allocation/transfer requests within department; books shared resources on department's behalf |
| **Employee**        | Views own allocated assets; books shared resources; raises maintenance requests; initiates return/transfer requests                         |

## Workflow Summary

1. Admin sets up departments, asset categories, and promotes select employees to Department Head / Asset Manager.
2. Asset Manager registers a new asset — it enters the system as Available.
3. The asset is allocated to an employee/department (blocked if already allocated — a transfer request is required instead) or marked as a shared bookable resource.
4. Employees book shared resources by time slot; overlapping requests are rejected automatically.
5. If an asset needs repair, the holder raises a maintenance request, which must be approved before work begins and before the asset flips to Under Maintenance.
6. Assets are transferred or returned as needs change; overdue returns are flagged automatically.
7. Periodic audit cycles assign auditors, verify assets, and auto-generate discrepancy reports before closing.
8. All activity is tracked through notifications, logs, and reports.

## Team Modules

| Module                             | Scope                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Identity & Org Setup**           | Login/Signup, Organization Setup (departments, categories, employee directory, role promotion), Dashboard KPIs |
| **Asset Registry & Allocation**    | Asset registration/search, lifecycle state machine, allocation & transfer workflow with conflict handling      |
| **Resource Booking & Maintenance** | Booking calendar with overlap validation, maintenance request approval workflow                                |
| **Audit, Reports & Notifications** | Audit cycles and discrepancy reports, analytics/reports, activity logs and notifications                       |

## Key Business Rules

- Signup creates an Employee account only; roles are assigned exclusively by Admin via the Employee Directory.
- An asset cannot be allocated to more than one employee/department at a time.
- A resource cannot be double-booked for overlapping time slots.
- Maintenance work cannot begin until the request is approved; asset status updates automatically on approval and resolution.
- Audit cycles must be closed to finalize discrepancy-driven status changes.
- Overdue allocations, bookings, and maintenance events are automatically flagged and surfaced via notifications and the dashboard.
