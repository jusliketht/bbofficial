# Business Logic Sequence Diagrams

## Expert Review Flagging Process

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant PaymentController
    participant ExpertReviewService
    participant ServiceTicketService
    participant EmailService
    participant AdminPanel

    User->>Frontend: Complete ITR filing + Select Expert Review
    Frontend->>PaymentController: Create payment order
    PaymentController->>Frontend: Return Razorpay order
    Frontend->>User: Show payment form
    User->>Frontend: Complete payment
    Frontend->>PaymentController: Verify payment signature
    PaymentController->>ExpertReviewService: Flag for expert review
    ExpertReviewService->>ServiceTicketService: Create service ticket
    ServiceTicketService->>AdminPanel: Add ticket to queue
    ExpertReviewService->>EmailService: Send confirmation email
    EmailService->>User: Email confirmation
    ExpertReviewService->>EmailService: Notify admin team
    EmailService->>AdminPanel: Admin notification
    ExpertReviewService->>PaymentController: Return success
    PaymentController->>Frontend: Payment verified
    Frontend->>User: Show success message
```

## Automated Invoice Generation and Delivery Process

```mermaid
sequenceDiagram
    participant User
    participant PaymentController
    participant InvoiceService
    participant PDFGenerator
    participant EmailService
    participant FileSystem

    User->>PaymentController: Complete payment
    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>InvoiceService: Create invoice record
    InvoiceService->>PDFGenerator: Generate PDF invoice
    PDFGenerator->>FileSystem: Save PDF file
    InvoiceService->>EmailService: Send invoice email
    EmailService->>FileSystem: Attach PDF
    EmailService->>User: Send invoice email
    InvoiceService->>PaymentController: Return invoice data
    PaymentController->>User: Payment success with invoice
```

## CA Firm Subscription Process

```mermaid
sequenceDiagram
    participant CA
    participant Frontend
    participant SubscriptionController
    participant PaymentController
    participant CAFirmService
    participant InvoiceService
    participant EmailService

    CA->>Frontend: Select subscription plan
    Frontend->>SubscriptionController: Get plans
    SubscriptionController->>Frontend: Return plans
    Frontend->>CA: Show plan options
    CA->>Frontend: Select plan + Enter firm details
    Frontend->>SubscriptionController: Create subscription order
    SubscriptionController->>PaymentController: Create Razorpay order
    PaymentController->>Frontend: Return order
    Frontend->>CA: Show payment form
    CA->>Frontend: Complete payment
    Frontend->>SubscriptionController: Verify payment
    SubscriptionController->>CAFirmService: Create CA firm
    CAFirmService->>CAFirmService: Update user role
    SubscriptionController->>InvoiceService: Generate invoice
    InvoiceService->>EmailService: Send invoice email
    EmailService->>CA: Send invoice
    SubscriptionController->>Frontend: Subscription created
    Frontend->>CA: Show success + redirect to CA dashboard
```

## Payment Verification and Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant PaymentController
    participant Razorpay
    participant Database
    participant InvoiceService
    participant ExpertReviewService

    User->>Frontend: Initiate payment
    Frontend->>PaymentController: Create order
    PaymentController->>Razorpay: Create order
    Razorpay->>PaymentController: Order created
    PaymentController->>Frontend: Order details
    Frontend->>User: Show payment form
    User->>Razorpay: Complete payment
    Razorpay->>Frontend: Payment response
    Frontend->>PaymentController: Verify signature
    PaymentController->>PaymentController: Verify signature
    PaymentController->>Database: Update payment status
    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>Database: Create invoice record
    InvoiceService->>InvoiceService: Generate PDF
    InvoiceService->>InvoiceService: Send email
    alt Expert Review Requested
        PaymentController->>ExpertReviewService: Flag for review
        ExpertReviewService->>Database: Update filing
        ExpertReviewService->>Database: Create ticket
    end
    PaymentController->>Frontend: Payment verified
    Frontend->>User: Show success
```

## Invoice Generation and Email Delivery

```mermaid
sequenceDiagram
    participant PaymentController
    participant InvoiceService
    participant PDFDocument
    participant FileSystem
    participant EmailService
    participant User

    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>InvoiceService: Create invoice record
    InvoiceService->>PDFDocument: Create PDF
    PDFDocument->>PDFDocument: Add header/footer
    PDFDocument->>PDFDocument: Add company details
    PDFDocument->>PDFDocument: Add customer details
    PDFDocument->>PDFDocument: Add service details
    PDFDocument->>PDFDocument: Add amount details
    PDFDocument->>FileSystem: Save PDF file
    InvoiceService->>EmailService: Send invoice email
    EmailService->>FileSystem: Attach PDF
    EmailService->>User: Send email with invoice
    InvoiceService->>PaymentController: Return invoice data
```

## Service Ticket Creation for Expert Review

```mermaid
sequenceDiagram
    participant ExpertReviewService
    participant ServiceTicketService
    participant Database
    participant EmailService
    participant AdminPanel

    ExpertReviewService->>ServiceTicketService: Create ticket
    ServiceTicketService->>Database: Create ticket record
    ServiceTicketService->>Database: Create initial message
    ServiceTicketService->>ExpertReviewService: Return ticket
    ExpertReviewService->>EmailService: Send confirmation email
    EmailService->>User: Email confirmation
    ExpertReviewService->>EmailService: Notify admin team
    EmailService->>AdminPanel: Admin notification
    AdminPanel->>AdminPanel: Add to ticket queue
```

## CA Firm Creation and Role Update

```mermaid
sequenceDiagram
    participant SubscriptionController
    participant CAFirmService
    participant Database
    participant UserService
    participant InvoiceService

    SubscriptionController->>CAFirmService: Create CA firm
    CAFirmService->>Database: Create firm record
    CAFirmService->>UserService: Update user role
    UserService->>Database: Update user role
    SubscriptionController->>InvoiceService: Generate invoice
    InvoiceService->>Database: Create invoice record
    InvoiceService->>InvoiceService: Generate PDF
    InvoiceService->>InvoiceService: Send email
    SubscriptionController->>Frontend: Return success
```

## Payment Gateway Integration Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant PaymentController
    participant Razorpay
    participant Database
    participant InvoiceService

    Frontend->>PaymentController: Create order
    PaymentController->>Razorpay: Create order
    Razorpay->>PaymentController: Order response
    PaymentController->>Frontend: Order details
    Frontend->>Razorpay: Initialize payment
    Razorpay->>User: Show payment form
    User->>Razorpay: Complete payment
    Razorpay->>Frontend: Payment response
    Frontend->>PaymentController: Verify signature
    PaymentController->>PaymentController: Verify signature
    PaymentController->>Database: Update payment status
    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>Database: Create invoice
    InvoiceService->>InvoiceService: Generate PDF
    InvoiceService->>InvoiceService: Send email
    PaymentController->>Frontend: Payment verified
    Frontend->>User: Show success
```

## Expert Review Queue Management

```mermaid
sequenceDiagram
    participant Admin
    participant AdminPanel
    participant ExpertReviewService
    participant Database
    participant EmailService
    participant User

    Admin->>AdminPanel: View expert review queue
    AdminPanel->>ExpertReviewService: Get review queue
    ExpertReviewService->>Database: Query pending reviews
    Database->>ExpertReviewService: Return reviews
    ExpertReviewService->>AdminPanel: Return queue
    AdminPanel->>Admin: Show review queue
    Admin->>AdminPanel: Complete review
    AdminPanel->>ExpertReviewService: Complete review
    ExpertReviewService->>Database: Update review status
    ExpertReviewService->>EmailService: Send completion email
    EmailService->>User: Email completion
    ExpertReviewService->>AdminPanel: Review completed
    AdminPanel->>Admin: Show completion
```

## Invoice Management and Resend

```mermaid
sequenceDiagram
    participant Admin
    participant AdminPanel
    participant InvoiceService
    participant Database
    participant FileSystem
    participant EmailService
    participant User

    Admin->>AdminPanel: View invoices
    AdminPanel->>InvoiceService: Get invoices
    InvoiceService->>Database: Query invoices
    Database->>InvoiceService: Return invoices
    InvoiceService->>AdminPanel: Return invoices
    AdminPanel->>Admin: Show invoices
    Admin->>AdminPanel: Resend invoice
    AdminPanel->>InvoiceService: Resend invoice
    InvoiceService->>Database: Get invoice data
    InvoiceService->>FileSystem: Check PDF exists
    alt PDF not exists
        InvoiceService->>InvoiceService: Generate PDF
        InvoiceService->>FileSystem: Save PDF
    end
    InvoiceService->>EmailService: Send invoice email
    EmailService->>FileSystem: Attach PDF
    EmailService->>User: Send invoice
    InvoiceService->>AdminPanel: Invoice sent
    AdminPanel->>Admin: Show success
```

## Subscription Plan Management

```mermaid
sequenceDiagram
    participant Admin
    participant AdminPanel
    participant SubscriptionController
    participant Database
    participant CAFirmService

    Admin->>AdminPanel: Manage subscription plans
    AdminPanel->>SubscriptionController: Get plans
    SubscriptionController->>Database: Query plans
    Database->>SubscriptionController: Return plans
    SubscriptionController->>AdminPanel: Return plans
    AdminPanel->>Admin: Show plans
    Admin->>AdminPanel: Update plan pricing
    AdminPanel->>SubscriptionController: Update plan
    SubscriptionController->>Database: Update plan
    Database->>SubscriptionController: Plan updated
    SubscriptionController->>AdminPanel: Update success
    AdminPanel->>Admin: Show success
```

## Payment Status Tracking

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant PaymentController
    participant Razorpay
    participant Database

    User->>Frontend: Check payment status
    Frontend->>PaymentController: Get payment status
    PaymentController->>Razorpay: Fetch payment
    Razorpay->>PaymentController: Payment details
    PaymentController->>Database: Get invoice
    Database->>PaymentController: Invoice data
    PaymentController->>Frontend: Payment status
    Frontend->>User: Show status
```

## Error Handling and Rollback

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant PaymentController
    participant Database
    participant InvoiceService
    participant ExpertReviewService

    User->>Frontend: Complete payment
    Frontend->>PaymentController: Verify payment
    PaymentController->>Database: Update payment status
    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>InvoiceService: Create invoice record
    InvoiceService->>InvoiceService: Generate PDF
    alt PDF generation fails
        InvoiceService->>PaymentController: Error
        PaymentController->>Database: Rollback payment
        PaymentController->>Frontend: Payment failed
        Frontend->>User: Show error
    else Expert review fails
        PaymentController->>ExpertReviewService: Flag for review
        ExpertReviewService->>PaymentController: Error
        PaymentController->>Database: Rollback payment
        PaymentController->>Frontend: Payment failed
        Frontend->>User: Show error
    end
```

## Success Flow - Complete Payment Processing

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant PaymentController
    participant Database
    participant InvoiceService
    participant ExpertReviewService
    participant EmailService

    User->>Frontend: Complete payment
    Frontend->>PaymentController: Verify payment
    PaymentController->>PaymentController: Verify signature
    PaymentController->>Database: Update payment status
    PaymentController->>InvoiceService: Generate invoice
    InvoiceService->>Database: Create invoice record
    InvoiceService->>InvoiceService: Generate PDF
    InvoiceService->>EmailService: Send invoice email
    EmailService->>User: Send invoice
    alt Expert review requested
        PaymentController->>ExpertReviewService: Flag for review
        ExpertReviewService->>Database: Update filing
        ExpertReviewService->>Database: Create ticket
        ExpertReviewService->>EmailService: Send confirmation
        EmailService->>User: Send confirmation
    end
    PaymentController->>Frontend: Payment verified
    Frontend->>User: Show success
```

## API Endpoints Summary

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify-signature` - Verify payment signature
- `GET /api/payments/status/:paymentId` - Get payment status
- `GET /api/payments/history` - Get payment history

### Subscription Endpoints
- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/plans/:planId` - Get plan by ID
- `POST /api/subscriptions/create-order` - Create subscription order
- `POST /api/subscriptions/verify-signature` - Verify subscription payment
- `GET /api/subscriptions/status` - Get subscription status
- `GET /api/subscriptions/history` - Get subscription history
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/upgrade` - Upgrade subscription

### Expert Review Endpoints
- `POST /api/expert-review/flag` - Flag filing for expert review
- `GET /api/expert-review/status/:filingId` - Get expert review status
- `POST /api/expert-review/complete` - Complete expert review
- `GET /api/expert-review/queue` - Get expert review queue

### Invoice Endpoints
- `GET /api/invoices/:invoiceId` - Get invoice by ID
- `GET /api/invoices/user/:userId` - Get user invoices
- `POST /api/invoices/:invoiceId/resend` - Resend invoice email
- `GET /api/invoices/:invoiceId/download` - Download invoice PDF

## Business Logic Flow Summary

1. **End User Payment Flow**
   - User completes ITR filing
   - Selects expert review (optional)
   - Makes payment through Razorpay
   - System verifies payment
   - Generates and sends invoice
   - Flags for expert review if requested
   - Creates service ticket for review

2. **CA Firm Subscription Flow**
   - CA selects subscription plan
   - Enters firm details
   - Makes payment through Razorpay
   - System verifies payment
   - Creates CA firm record
   - Updates user role
   - Generates and sends invoice

3. **Expert Review Process**
   - Filing flagged for review
   - Service ticket created
   - Admin team notified
   - Expert completes review
   - User notified of completion
   - Filing status updated

4. **Invoice Generation**
   - Payment verified
   - Invoice record created
   - PDF generated
   - Email sent with PDF
   - Invoice stored for future access

## Error Handling

- Payment verification failures
- PDF generation errors
- Email delivery failures
- Database transaction rollbacks
- Service ticket creation errors
- Expert review processing errors

## Security Considerations

- Payment signature verification
- Secure PDF generation
- Encrypted email delivery
- Database transaction integrity
- Admin access controls
- Audit logging
