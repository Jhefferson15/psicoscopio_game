import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect } from 'vitest';
import { EvaluationForm } from '../src/features/game/presentation/components/EvaluationForm';
import { MEEGA_QUESTIONS } from '../src/features/game/domain/constants/meegaQuestions';

// Mock dependências do contexto e repositório
vi.mock('../src/features/game/presentation/state/useGame', () => ({
  useGame: () => ({
    roomId: 'test-room-id'
  })
}));

vi.mock('../src/features/auth/presentation/state/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Tester' }
  })
}));

vi.mock('../src/features/game/data/repositories/FirebaseGameSyncRepository', () => {
  return {
    FirebaseGameSyncRepository: class {
      saveEvaluation = vi.fn().mockResolvedValue(true);
    }
  };
});

describe('EvaluationForm Component', () => {
  it('renderiza o formulário MEEGA+ corretamente', () => {
    render(<EvaluationForm onComplete={vi.fn()} />);
    
    expect(screen.getByText('Avaliação')).toBeInTheDocument();
    expect(screen.getAllByText('Usabilidade')[0]).toBeInTheDocument();
    
    // Verifica se as perguntas estão renderizadas (pega algumas de exemplo)
    expect(screen.getByText('O design do jogo é atraente (interface, gráficos, tabuleiro, cartas, etc.).')).toBeInTheDocument();
  });

  it('permite responder às perguntas e submeter o formulário', async () => {
    const onCompleteMock = vi.fn();
    render(<EvaluationForm onComplete={onCompleteMock} />);
    
    // O componente é dividido em categorias. Precisamos responder e avançar.
    for (let i = 0; i < MEEGA_QUESTIONS.length; i++) {
      const currentCat = MEEGA_QUESTIONS[i];
      const questions = currentCat.subcategories.flatMap(sub => sub.questions);
      
      for (const q of questions) {
        // Aguarda a pergunta estar visível (por causa das animações)
        const questionText = await screen.findByText(q.text);
        const questionContainer = questionText.closest('.question-item');
        
        // Encontra o label "Concordo Totalmente" dentro desta questão
        const option = within(questionContainer).getByText('Concordo Totalmente');
        fireEvent.click(option);
      }

      if (i < MEEGA_QUESTIONS.length - 1) {
        const nextBtn = screen.getByText('Próxima Etapa');
        fireEvent.click(nextBtn);
      }
    }

    const submitBtn = screen.getByText('Finalizar');
    
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    }, { timeout: 3000 });

    // Submete
    fireEvent.click(submitBtn);

    // Verifica a mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText('Avaliação Enviada!')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verifica se onComplete foi chamado (com delay no componente original)
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});

