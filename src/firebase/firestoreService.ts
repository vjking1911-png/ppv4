import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
import { 
  Transaction, 
  BudgetCategory, 
  SavingsGoal, 
  RecurringBill, 
  UserFinancialProfile 
} from '../types/finance';

export const firestoreService = {
  // User Profile
  subscribeUserProfile(
    userId: string, 
    onUpdate: (profile: UserFinancialProfile | null) => void
  ) {
    const docPath = `users/${userId}`;
    const docRef = doc(db, 'users', userId);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as UserFinancialProfile);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    );
  },

  async saveUserProfile(userId: string, profile: UserFinancialProfile): Promise<void> {
    const docPath = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Transactions
  subscribeTransactions(
    userId: string,
    onUpdate: (transactions: Transaction[]) => void
  ) {
    const colPath = `users/${userId}/transactions`;
    const colRef = collection(db, 'users', userId, 'transactions');
    const q = query(colRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const transactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        onUpdate(transactions);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addTransaction(userId: string, tx: Transaction): Promise<void> {
    const docPath = `users/${userId}/transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'transactions', tx.id), {
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        categoryId: tx.categoryId,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        notes: tx.notes || '',
        isRecurring: tx.isRecurring || false,
        userId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async deleteTransaction(userId: string, txId: string): Promise<void> {
    const docPath = `users/${userId}/transactions/${txId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Categories
  subscribeCategories(
    userId: string,
    onUpdate: (categories: BudgetCategory[]) => void
  ) {
    const colPath = `users/${userId}/categories`;
    const colRef = collection(db, 'users', userId, 'categories');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const categories: BudgetCategory[] = [];
        snapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() } as BudgetCategory);
        });
        onUpdate(categories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async saveCategories(userId: string, categories: BudgetCategory[]): Promise<void> {
    for (const cat of categories) {
      const docPath = `users/${userId}/categories/${cat.id}`;
      try {
        await setDoc(doc(db, 'users', userId, 'categories', cat.id), {
          name: cat.name,
          group: cat.group,
          monthlyLimit: cat.monthlyLimit,
          color: cat.color,
          icon: cat.icon || '',
          userId,
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
    }
  },

  // Savings Goals
  subscribeSavingsGoals(
    userId: string,
    onUpdate: (goals: SavingsGoal[]) => void
  ) {
    const colPath = `users/${userId}/savingsGoals`;
    const colRef = collection(db, 'users', userId, 'savingsGoals');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const goals: SavingsGoal[] = [];
        snapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() } as SavingsGoal);
        });
        onUpdate(goals);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async saveSavingsGoal(userId: string, goal: SavingsGoal): Promise<void> {
    const docPath = `users/${userId}/savingsGoals/${goal.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'savingsGoals', goal.id), {
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        category: goal.category,
        color: goal.color,
        monthlyTarget: goal.monthlyTarget || 0,
        userId,
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async deleteSavingsGoal(userId: string, goalId: string): Promise<void> {
    const docPath = `users/${userId}/savingsGoals/${goalId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'savingsGoals', goalId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Recurring Bills
  subscribeBills(
    userId: string,
    onUpdate: (bills: RecurringBill[]) => void
  ) {
    const colPath = `users/${userId}/bills`;
    const colRef = collection(db, 'users', userId, 'bills');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const bills: RecurringBill[] = [];
        snapshot.forEach((doc) => {
          bills.push({ id: doc.id, ...doc.data() } as RecurringBill);
        });
        onUpdate(bills);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async saveBill(userId: string, bill: RecurringBill): Promise<void> {
    const docPath = `users/${userId}/bills/${bill.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'bills', bill.id), {
        title: bill.title,
        amount: bill.amount,
        dueDay: bill.dueDay,
        categoryId: bill.categoryId,
        isAutoDebit: bill.isAutoDebit,
        isPaidThisMonth: bill.isPaidThisMonth,
        provider: bill.provider || '',
        userId,
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async deleteBill(userId: string, billId: string): Promise<void> {
    const docPath = `users/${userId}/bills/${billId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'bills', billId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Initial seeding for new user
  async seedUserInitialData(
    userId: string,
    profile: UserFinancialProfile,
    categories: BudgetCategory[],
    transactions: Transaction[],
    goals: SavingsGoal[],
    bills: RecurringBill[]
  ): Promise<void> {
    await this.saveUserProfile(userId, profile);
    await this.saveCategories(userId, categories);
    for (const tx of transactions) {
      await this.addTransaction(userId, tx);
    }
    for (const goal of goals) {
      await this.saveSavingsGoal(userId, goal);
    }
    for (const bill of bills) {
      await this.saveBill(userId, bill);
    }
  }
};
