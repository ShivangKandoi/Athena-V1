"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format, isToday, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BadgeDollarSign,
  BarChart3,
  Calendar,
  DollarSign,
  LineChart,
  PieChart,
  Plus,
  Sparkles,
  Wallet,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFinanceProfile,
  updateFinanceGoals,
  addExpenseEntry,
  deleteExpenseEntry,
  addIncomeEntry,
  deleteIncomeEntry,
  FinanceProfile,
  ExpenseEntry,
  IncomeEntry
} from "@/lib/finance-service";
import { PageLoader } from "@/components/ui/page-loader";

export default function FinancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState<FinanceProfile | null>(null);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [activeTab, setActiveTab] = useState("expenses");

  // Form states
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [incomeFormData, setIncomeFormData] = useState({
    source: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const today = new Date();

  // Fetch finance data from API
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const data = await getFinanceProfile();
        setFinanceData(data);
      } catch (error) {
        console.error('Error fetching finance data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load finance data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchFinanceData();
    }
  }, [user, toast]);

  // Calculate budget metrics from real data
  const totalIncome = financeData?.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const totalExpenses = financeData?.expenseEntries.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const remaining = totalIncome - totalExpenses;
  const remainingPercentage = totalIncome > 0 ? Math.min(100, Math.round((remaining / totalIncome) * 100)) : 0;
  const savingsPercentage = totalIncome > 0 ? Math.min(100, Math.round((financeData?.savingsGoal || 0) / totalIncome * 100)) : 0;

  // Calculate spending breakdown by category
  const calculateSpendingBreakdown = () => {
    if (!financeData) return [];
    
    const categories = [
      'housing', 'food', 'transportation', 'utilities', 
      'entertainment', 'shopping', 'healthcare', 'other'
    ];
    
    const breakdown = categories.map(category => {
      const entriesInCategory = financeData.expenseEntries.filter(
        expense => expense.category === category
      );
      
      const amount = entriesInCategory.reduce((sum, entry) => sum + entry.amount, 0);
      const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
      
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount,
        percentage,
        color: getCategoryColor(category)
      };
    }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
    
    return breakdown;
  };
  
  const getCategoryColor = (category: string) => {
    const colors = {
      housing: 'bg-violet-500',
      food: 'bg-blue-500',
      transportation: 'bg-green-500',
      utilities: 'bg-yellow-500',
      entertainment: 'bg-red-500',
      shopping: 'bg-pink-500',
      healthcare: 'bg-indigo-500',
      other: 'bg-gray-500'
    };
    
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  // Handle form input changes
  const handleExpenseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpenseFormData({
      ...expenseFormData,
      [name]: value,
    });
  };
  
  const handleIncomeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIncomeFormData({
      ...incomeFormData,
      [name]: value,
    });
  };
  
  // Handle select changes
  const handleCategoryChange = (value: string) => {
    setExpenseFormData({
      ...expenseFormData,
      category: value,
    });
  };
  
  const handleSourceChange = (value: string) => {
    setIncomeFormData({
      ...incomeFormData,
      source: value,
    });
  };

  // Add transaction functions
  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transactionType === "expense") {
      await addExpenseTransaction(e);
    } else {
      await addIncomeTransaction(e);
    }
  };
  
  const addExpenseTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseFormData.category || !expenseFormData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a category and amount for the expense.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<ExpenseEntry, '_id'> = {
        category: expenseFormData.category as ExpenseEntry['category'],
        amount: parseFloat(expenseFormData.amount),
        description: expenseFormData.description,
        date: new Date(expenseFormData.date).toISOString(),
      };
      
      const addedEntry = await addExpenseEntry(newEntry);
      
      // Update local state
      if (financeData) {
        setFinanceData({
          ...financeData,
          expenseEntries: [...financeData.expenseEntries, addedEntry],
        });
      }
      
      // Reset form
      setExpenseFormData({
        category: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setNewTransactionOpen(false);
      
      toast({
        title: 'Success',
        description: 'Expense added successfully.',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const addIncomeTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeFormData.source || !incomeFormData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a source and amount for the income.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<IncomeEntry, '_id'> = {
        source: incomeFormData.source as IncomeEntry['source'],
        amount: parseFloat(incomeFormData.amount),
        description: incomeFormData.description,
        date: new Date(incomeFormData.date).toISOString(),
      };
      
      const addedEntry = await addIncomeEntry(newEntry);
      
      // Update local state
      if (financeData) {
        setFinanceData({
          ...financeData,
          incomeEntries: [...financeData.incomeEntries, addedEntry],
        });
      }
      
      // Reset form
      setIncomeFormData({
        source: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setNewTransactionOpen(false);
      
      toast({
        title: 'Success',
        description: 'Income added successfully.',
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: 'Error',
        description: 'Failed to add income. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageLoader message="Loading your finance data..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-24">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-violet-900 to-purple-800 dark:from-violet-950 dark:to-purple-900 rounded-xl p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Finance Tracker</h1>
            <p className="text-violet-200 text-sm">
              Manage your income, expenses, and savings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              onClick={() => {
                setTransactionType("expense");
                setNewTransactionOpen(true);
              }}
              className="bg-purple-700/40 hover:bg-purple-700/60 text-white border-none"
            >
              <ArrowUpIcon className="h-4 w-4 mr-2 rotate-180" />
              Add Expense
            </Button>

            <Button
              onClick={() => {
                setTransactionType("income");
                setNewTransactionOpen(true);
              }}
              className="bg-purple-700/40 hover:bg-purple-700/60 text-white border-none"
            >
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </div>

        {/* Budget Overview Card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold">Budget Overview</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(today, 'MMMM yyyy')}
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm font-medium">Remaining Budget</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-medium">${remaining.toFixed(2)}</span>
                  <span className="text-slate-400"> / ${totalIncome.toFixed(2)}</span>
                </div>
              </div>
              <Progress value={remainingPercentage} className="h-2"
                style={{
                  "--tw-progress-color": "rgb(34, 197, 94)"
                } as React.CSSProperties}
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div>Income: ${totalIncome.toFixed(2)}</div>
                <div>Spent: ${totalExpenses.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Savings Goal</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-medium">${financeData?.savingsGoal || 0}</span>
                  <span className="text-slate-400"> / ${totalIncome.toFixed(2)}</span>
                </div>
              </div>
              <Progress value={savingsPercentage} className="h-2 bg-blue-100 dark:bg-blue-900/30"
                style={{
                  "--tw-progress-color": "rgb(59, 130, 246)"
                } as React.CSSProperties}
              />
              <div className="text-xs text-slate-500">
                {savingsPercentage}% of monthly income
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold">Transactions</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recent income and expenses
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger value="expenses" className="rounded-md">
                  <ArrowUpIcon className="h-4 w-4 mr-2 rotate-180" />
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="income" className="rounded-md">
                  <ArrowDownIcon className="h-4 w-4 mr-2" />
                  Income
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-3">
                {financeData?.expenseEntries.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <ArrowUpIcon className="mb-2 h-8 w-8 text-muted-foreground rotate-180" />
                    <p className="text-sm text-muted-foreground">No expense entries yet</p>
                    <Button
                      onClick={() => {
                        setTransactionType("expense");
                        setNewTransactionOpen(true);
                      }}
                      variant="link"
                      className="mt-2"
                    >
                      Add your first expense
                    </Button>
                  </div>
                ) : (
                  financeData?.expenseEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(expense => (
                      <div key={expense._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full">
                            <ArrowUpIcon className="h-4 w-4 rotate-180" />
                          </div>
                          <div>
                            <div className="font-medium">{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{expense.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-600 dark:text-red-400">-${expense.amount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(expense.date), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="income" className="space-y-3">
                {financeData?.incomeEntries.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <ArrowDownIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No income entries yet</p>
                    <Button
                      onClick={() => {
                        setTransactionType("income");
                        setNewTransactionOpen(true);
                      }}
                      variant="link"
                      className="mt-2"
                    >
                      Add your first income
                    </Button>
                  </div>
                ) : (
                  financeData?.incomeEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(income => (
                      <div key={income._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full">
                            <ArrowDownIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{income.source.charAt(0).toUpperCase() + income.source.slice(1)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{income.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600 dark:text-green-400">+${income.amount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(income.date), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {calculateSpendingBreakdown().length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <PieChart className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Add expenses to see your spending breakdown</p>
              </div>
            ) : (
              calculateSpendingBreakdown().map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{item.category}</span>
                    <span className="text-sm font-medium">${item.amount.toFixed(2)} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Transaction Form Sheet */}
        <Sheet open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
            <form onSubmit={addTransaction}>
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Add {transactionType === "expense" ? "Expense" : "Income"}</SheetTitle>
                <SheetDescription>
                  Record your {transactionType === "expense" ? "spending" : "earnings"} to track your finances.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {transactionType === "expense" ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="expense-category">Category</Label>
                      <Select value={expenseFormData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="expense-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="housing">Housing</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expense-amount">Amount ($)</Label>
                      <Input 
                        id="expense-amount" 
                        name="amount"
                        type="number" 
                        placeholder="e.g., 120" 
                        step="0.01"
                        value={expenseFormData.amount}
                        onChange={handleExpenseInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expense-date">Date</Label>
                      <Input 
                        id="expense-date" 
                        name="date"
                        type="date" 
                        value={expenseFormData.date}
                        onChange={handleExpenseInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expense-description">Description (Optional)</Label>
                      <Input 
                        id="expense-description" 
                        name="description"
                        placeholder="e.g., Monthly rent payment"
                        value={expenseFormData.description}
                        onChange={handleExpenseInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="income-source">Source</Label>
                      <Select value={incomeFormData.source} onValueChange={handleSourceChange}>
                        <SelectTrigger id="income-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="gift">Gift</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="income-amount">Amount ($)</Label>
                      <Input 
                        id="income-amount" 
                        name="amount"
                        type="number" 
                        placeholder="e.g., 1500" 
                        step="0.01"
                        value={incomeFormData.amount}
                        onChange={handleIncomeInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="income-date">Date</Label>
                      <Input 
                        id="income-date" 
                        name="date"
                        type="date" 
                        value={incomeFormData.date}
                        onChange={handleIncomeInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="income-description">Description (Optional)</Label>
                      <Input 
                        id="income-description" 
                        name="description"
                        placeholder="e.g., Monthly salary"
                        value={incomeFormData.description}
                        onChange={handleIncomeInputChange}
                      />
                    </div>
                  </>
                )}
              </div>
              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                  Add {transactionType === "expense" ? "Expense" : "Income"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  );
}
