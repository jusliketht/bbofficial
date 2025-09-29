import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/card';
import { Button } from '../../components/UI/button';
import { Input } from '../../components/UI/input';
import { Label } from '../../components/UI/label';
import { Select } from '../../components/UI/select';
import { Alert } from '../../components/UI/alert';
import { Badge } from '../../components/UI/badge';
import { Tabs } from '../../components/UI/tabs';
import { Table } from '../../components/UI/table';
import { Dialog } from '../../components/UI/dialog';
import { 
  Loader2, Plus, Edit, Trash2, Eye, CreditCard, Receipt, 
  TrendingUp, DollarSign, FileText, Download, AlertCircle,
  CheckCircle, Clock, XCircle, Send, Calendar, Filter
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { comprehensiveBillingService } from '../../services/comprehensiveBillingService';
import toast from 'react-hot-toast';

/**
 * Comprehensive Billing Management Component
 * Provides complete billing, invoicing, and payment management interface
 * Essential for revenue management and GST compliance
 */
const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });

  // Dialog states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isGSTReportOpen, setIsGSTReportOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    serviceType: '',
    amount: '',
    customerDetails: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    dueDate: '',
    description: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    method: '',
    amount: '',
    cardDetails: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    },
    upiId: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  /**
   * Load initial data
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesResult, methodsResult, summaryResult] = await Promise.all([
        comprehensiveBillingService.getServiceCategories(),
        comprehensiveBillingService.getPaymentMethods(),
        comprehensiveBillingService.getBillingSummary()
      ]);

      if (categoriesResult.success) {
        setServiceCategories(categoriesResult.data.categories);
      }

      if (methodsResult.success) {
        setPaymentMethods(methodsResult.data.paymentMethods);
      }

      if (summaryResult.success) {
        setBillingSummary(summaryResult.data);
      }
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data based on active tab
   */
  const loadData = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'invoices') {
        const result = await comprehensiveBillingService.getInvoices(filters);
        if (result.success) {
          setInvoices(result.data.invoices);
        }
      } else if (activeTab === 'payments') {
        const result = await comprehensiveBillingService.getPayments(filters);
        if (result.success) {
          setPayments(result.data.payments);
        }
      }
    } catch (error) {
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle create invoice
   */
  const handleCreateInvoice = async () => {
    try {
      setIsLoading(true);

      const invoiceData = {
        ...invoiceForm,
        amount: parseFloat(invoiceForm.amount),
        dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const result = await comprehensiveBillingService.createInvoice(invoiceData);
      
      if (result.success) {
        toast.success('Invoice created successfully');
        setIsCreateInvoiceOpen(false);
        setInvoiceForm({
          serviceType: '',
          amount: '',
          customerDetails: { name: '', email: '', phone: '', address: '' },
          dueDate: '',
          description: ''
        });
        loadData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle process payment
   */
  const handleProcessPayment = async () => {
    try {
      setIsLoading(true);

      const validation = comprehensiveBillingService.validatePaymentData(paymentForm);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      const result = await comprehensiveBillingService.processPayment(
        selectedInvoice.invoice_id,
        paymentForm
      );

      if (result.success) {
        toast.success('Payment processed successfully');
        setIsPaymentOpen(false);
        setPaymentForm({
          method: '',
          amount: '',
          cardDetails: { cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', cardholderName: '' },
          upiId: '',
          bankDetails: { accountNumber: '', ifscCode: '', accountHolderName: '' }
        });
        loadData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle delete invoice
   */
  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await comprehensiveBillingService.deleteInvoice(invoiceId);
      
      if (result.success) {
        toast.success('Invoice deleted successfully');
        loadData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete invoice');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle generate GST report
   */
  const handleGenerateGSTReport = async () => {
    try {
      setIsLoading(true);
      const result = await comprehensiveBillingService.generateGSTReport(filters);
      
      if (result.success) {
        toast.success('GST report generated successfully');
        // Here you would typically download or display the report
        console.log('GST Report:', result.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate GST report');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render billing summary cards
   */
  const renderBillingSummary = () => {
    if (!billingSummary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold">{billingSummary.invoices.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {comprehensiveBillingService.formatAmount(billingSummary.amounts.totalBilled)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="text-2xl font-bold">
                  {comprehensiveBillingService.formatAmount(billingSummary.amounts.totalPaid)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold">
                  {comprehensiveBillingService.formatAmount(billingSummary.amounts.totalPending)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Render invoices table
   */
  const renderInvoicesTable = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select value={invoiceForm.serviceType} onValueChange={(value) => 
                        setInvoiceForm(prev => ({ ...prev, serviceType: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceCategories).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter description"
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name"
                        value={invoiceForm.customerDetails.name}
                        onChange={(e) => setInvoiceForm(prev => ({
                          ...prev,
                          customerDetails: { ...prev.customerDetails, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="Enter customer email"
                        value={invoiceForm.customerDetails.email}
                        onChange={(e) => setInvoiceForm(prev => ({
                          ...prev,
                          customerDetails: { ...prev.customerDetails, email: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateInvoice} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Invoice'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const statusInfo = comprehensiveBillingService.getStatusDisplayInfo(invoice.status);
                return (
                  <TableRow key={invoice.invoice_id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.service_type}</TableCell>
                    <TableCell>{comprehensiveBillingService.formatAmount(invoice.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'SENT' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setPaymentForm(prev => ({ ...prev, amount: invoice.total_amount }));
                              setIsPaymentOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteInvoice(invoice.invoice_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render payments table
   */
  const renderPaymentsTable = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const statusInfo = comprehensiveBillingService.getStatusDisplayInfo(payment.status);
                return (
                  <TableRow key={payment.payment_id}>
                    <TableCell className="font-mono">{payment.payment_id.substring(0, 8)}...</TableCell>
                    <TableCell>{payment.invoice_number}</TableCell>
                    <TableCell>{comprehensiveBillingService.formatAmount(payment.amount)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsGSTReportOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            GST Report
          </Button>
        </div>
      </div>

      {renderBillingSummary()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          {renderInvoicesTable()}
        </TabsContent>

        <TabsContent value="payments">
          {renderPaymentsTable()}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentForm.method} onValueChange={(value) => 
                setPaymentForm(prev => ({ ...prev, method: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.method} value={method.method}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentAmount">Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder="Enter amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            {paymentForm.method === 'RAZORPAY' || paymentForm.method === 'STRIPE' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardDetails.cardNumber}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      cardDetails: { ...prev.cardDetails, cardNumber: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="MM"
                      value={paymentForm.cardDetails.expiryMonth}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        cardDetails: { ...prev.cardDetails, expiryMonth: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                      id="expiryYear"
                      placeholder="YYYY"
                      value={paymentForm.cardDetails.expiryYear}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        cardDetails: { ...prev.cardDetails, expiryYear: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentForm.cardDetails.cvv}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        cardDetails: { ...prev.cardDetails, cvv: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
            ) : paymentForm.method === 'UPI' ? (
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="user@paytm"
                  value={paymentForm.upiId}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, upiId: e.target.value }))}
                />
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingManagement;
