import { AppDataSource } from '../config/database-init';
import { LoanCategory } from '../models/LoanCategory';
import { ObligationCategory } from '../models/ObligationCategory';
import { ApiError } from '../middleware/errorHandler';

const DEFAULT_CATEGORIES = [
  { name: 'Rodzina', color: '#ff6b6b' },
  { name: 'Praca', color: '#4c6ef5' },
  { name: 'Bank', color: '#0ca678' },
  { name: 'Kredyt', color: '#5c7cfa' },
  { name: 'Inny', color: '#9c36b5' },
];

export class CategoryService {
  private loanCategoryRepo = AppDataSource.getRepository(LoanCategory);
  private obligationCategoryRepo = AppDataSource.getRepository(ObligationCategory);

  // ===== LOAN CATEGORIES =====
  async addLoanCategory(loanId: string, userId: string, name: string, color?: string): Promise<LoanCategory> {
    if (!name?.trim()) {
      throw new ApiError(400, 'INVALID_INPUT', 'Nazwa kategorii nie może być pusta');
    }

    const category = this.loanCategoryRepo.create({
      loanId,
      userId,
      name: name.trim(),
      color: color || '#9c36b5',
    });

    return await this.loanCategoryRepo.save(category);
  }

  async getLoanCategories(loanId: string): Promise<LoanCategory[]> {
    return await this.loanCategoryRepo.find({
      where: { loanId },
      order: { createdAt: 'ASC' },
    });
  }

  async removeLoanCategory(categoryId: string): Promise<void> {
    const result = await this.loanCategoryRepo.delete(categoryId);
    if (result.affected === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Kategoria nie znaleziona');
    }
  }

  async removeLoanCategoriesByName(loanId: string, name: string): Promise<void> {
    await this.loanCategoryRepo.delete({ loanId, name });
  }

  // ===== OBLIGATION CATEGORIES =====
  async addObligationCategory(
    obligationId: string,
    userId: string,
    name: string,
    color?: string
  ): Promise<ObligationCategory> {
    if (!name?.trim()) {
      throw new ApiError(400, 'INVALID_INPUT', 'Nazwa kategorii nie może być pusta');
    }

    const category = this.obligationCategoryRepo.create({
      obligationId,
      userId,
      name: name.trim(),
      color: color || '#9c36b5',
    });

    return await this.obligationCategoryRepo.save(category);
  }

  async getObligationCategories(obligationId: string): Promise<ObligationCategory[]> {
    return await this.obligationCategoryRepo.find({
      where: { obligationId },
      order: { createdAt: 'ASC' },
    });
  }

  async removeObligationCategory(categoryId: string): Promise<void> {
    const result = await this.obligationCategoryRepo.delete(categoryId);
    if (result.affected === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Kategoria nie znaleziona');
    }
  }

  async removeObligationCategoriesByName(obligationId: string, name: string): Promise<void> {
    await this.obligationCategoryRepo.delete({ obligationId, name });
  }

  // ===== UTILITIES =====
  getDefaultCategories() {
    return DEFAULT_CATEGORIES;
  }
}

export const categoryService = new CategoryService();
