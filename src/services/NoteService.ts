import { AppDataSource } from '../config/database-init';
import { LoanNote } from '../models/LoanNote';
import { ObligationNote } from '../models/ObligationNote';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuid } from 'uuid';

export class NoteService {
  private loanNoteRepo = AppDataSource.getRepository(LoanNote);
  private obligationNoteRepo = AppDataSource.getRepository(ObligationNote);

  // ===== LOAN NOTES =====
  async addLoanNote(loanId: string, userId: string, text: string): Promise<LoanNote> {
    if (!text?.trim()) {
      throw new ApiError(400, 'INVALID_INPUT', 'Notatka nie może być pusta');
    }

    const note = this.loanNoteRepo.create({
      id: uuid(),
      loanId,
      userId,
      text: text.trim(),
    });

    return await this.loanNoteRepo.save(note);
  }

  async getLoanNotes(loanId: string): Promise<LoanNote[]> {
    return await this.loanNoteRepo.find({
      where: { loanId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteLoanNote(noteId: string): Promise<void> {
    const result = await this.loanNoteRepo.delete(noteId);
    if (result.affected === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Notatka nie znaleziona');
    }
  }

  // ===== OBLIGATION NOTES =====
  async addObligationNote(obligationId: string, userId: string, text: string): Promise<ObligationNote> {
    if (!text?.trim()) {
      throw new ApiError(400, 'INVALID_INPUT', 'Notatka nie może być pusta');
    }

    const note = this.obligationNoteRepo.create({
      id: uuid(),
      obligationId,
      userId,
      text: text.trim(),
    });

    return await this.obligationNoteRepo.save(note);
  }

  async getObligationNotes(obligationId: string): Promise<ObligationNote[]> {
    return await this.obligationNoteRepo.find({
      where: { obligationId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteObligationNote(noteId: string): Promise<void> {
    const result = await this.obligationNoteRepo.delete(noteId);
    if (result.affected === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Notatka nie znaleziona');
    }
  }
}
