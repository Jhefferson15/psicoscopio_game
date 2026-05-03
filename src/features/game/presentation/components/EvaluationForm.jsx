import { useState, useRef, useEffect, useMemo } from 'react';
import { MEEGA_QUESTIONS, LIKERT_SCALE } from '../../domain/constants/meegaQuestions';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository';
import { SaveEvaluationUseCase } from '../../domain/usecases/SaveEvaluationUseCase';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Star,
  Frown,
  Meh,
  Smile,
  Heart,
  ArrowRight,
  X
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import './EvaluationForm.css';

const LIKERT_ICONS = {
  1: <Frown size={24} />,
  2: <Frown size={24} className="opacity-70" />,
  3: <Meh size={24} />,
  4: <Smile size={24} />,
  5: <Heart size={24} fill="currentColor" />
};

export const EvaluationForm = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [focusedQuestionIdx, setFocusedQuestionIdx] = useState(0); // Para mobile: uma questão por vez
  const [showError, setShowError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const contentRef = useRef(null);

  const { roomId } = useGame();
  const { user } = useAuth();

  const allQuestions = useMemo(() => MEEGA_QUESTIONS.flatMap(category => 
    category.subcategories.flatMap(sub => sub.questions)
  ), []);

  const currentCategory = MEEGA_QUESTIONS[currentCategoryIdx];
  const currentCategoryQuestions = useMemo(() => 
    currentCategory.subcategories.flatMap(sub => sub.questions),
    [currentCategory]
  );

  const isCurrentCategoryComplete = currentCategoryQuestions.every(q => answers[q.id] !== undefined);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAnswer = (questionId, value) => {
    setShowError(false);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Auto-avanço no mobile
    if (isMobile) {
      setTimeout(() => {
        if (focusedQuestionIdx < currentCategoryQuestions.length - 1) {
          setFocusedQuestionIdx(prev => prev + 1);
        } else if (currentCategoryIdx < MEEGA_QUESTIONS.length - 1) {
          // Se for a última questão da categoria, espera o usuário clicar em próxima etapa ou avança?
          // Melhor esperar o usuário clicar para dar controle.
        }
      }, 400);
    }
  };

  const totalAnswered = Object.keys(answers).length;
  const isComplete = totalAnswered === allQuestions.length;
  const progressPercentage = (totalAnswered / allQuestions.length) * 100;

  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentCategoryIdx]);

  const nextCategory = () => {
    if (!isCurrentCategoryComplete) {
      setShowError(true);
      return;
    }
    if (currentCategoryIdx < MEEGA_QUESTIONS.length - 1) {
      setCurrentCategoryIdx(prev => prev + 1);
      setFocusedQuestionIdx(0);
    }
  };

  const prevCategory = () => {
    setShowError(false);
    if (isMobile && focusedQuestionIdx > 0) {
      setFocusedQuestionIdx(prev => prev - 1);
    } else {
      const nextIdx = Math.max(currentCategoryIdx - 1, 0);
      if (nextIdx !== currentCategoryIdx) {
        setCurrentCategoryIdx(nextIdx);
        setFocusedQuestionIdx(0);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isComplete) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const evaluationData = {
        roomId: roomId || 'offline',
        userId: user?.id || 'anonymous',
        timestamp: Date.now(),
        answers: answers
      };

      const syncRepo = new FirebaseGameSyncRepository();
      await SaveEvaluationUseCase.execute(syncRepo, evaluationData);
      
      setSubmitted(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      if (onComplete) onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        className="evaluation-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="evaluation-modal success-modal">
          <motion.div 
            className="success-icon-wrapper"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            <Check size={48} strokeWidth={3} />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Avaliação Enviada!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Obrigado por ajudar a evoluir o <strong>Psicoscópio</strong>. Sua contribuição é fundamental para nossa pesquisa.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="evaluation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="evaluation-modal">
        <header className="evaluation-header">
          <div className="header-top">
             <div className="header-titles">
              <h2>Avaliação</h2>
              <p>Modelo MEEGA+</p>
            </div>
            
            <div className="header-actions-right">
              <div className="progress-badge">
                 <div className="progress-ring">
                    <svg viewBox="0 0 36 36">
                      <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <motion.path 
                        className="ring-fill" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        strokeDasharray={`${progressPercentage}, 100`}
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                      />
                    </svg>
                    <span className="progress-value">{Math.round(progressPercentage)}%</span>
                 </div>
              </div>

              <button 
                className="btn-close-evaluation" 
                onClick={onComplete}
                aria-label="Sair da avaliação"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="category-stepper">
            {MEEGA_QUESTIONS.map((cat, idx) => {
              const catQuestions = cat.subcategories.flatMap(sub => sub.questions);
              const catAnsweredCount = catQuestions.filter(q => answers[q.id] !== undefined).length;
              const isCatComplete = catAnsweredCount === catQuestions.length;
              const isActive = idx === currentCategoryIdx;
              
              return (
                <div 
                  key={idx} 
                  className={`step-item ${isActive ? 'active' : ''} ${isCatComplete ? 'completed' : ''}`}
                  onClick={() => {
                    if (idx < currentCategoryIdx || isCatComplete) {
                      setCurrentCategoryIdx(idx);
                      setFocusedQuestionIdx(0);
                    }
                  }}
                >
                  <div className="step-circle">
                    {isCatComplete ? <Check size={12} strokeWidth={4} /> : (idx + 1)}
                  </div>
                  <span className="step-label">{cat.category}</span>
                </div>
              );
            })}
          </div>
        </header>

        <div className="evaluation-content" ref={contentRef}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${currentCategoryIdx}-${isMobile ? focusedQuestionIdx : 'desktop'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="evaluation-view-container"
            >
              {!isMobile ? (
                // Desktop View (Original List)
                <div className="desktop-evaluation-list">
                  <div className="category-hero">
                    <h3>{currentCategory.category}</h3>
                    <p>Selecione o nível de concordância para cada afirmação.</p>
                  </div>

                  {currentCategory.subcategories.map((sub, subIdx) => (
                    <div key={subIdx} className="evaluation-subcategory">
                      <h4 className="subcategory-title">
                        <Star size={14} fill="currentColor" />
                        {sub.name}
                      </h4>
                      <div className="questions-list">
                        {sub.questions.map((q) => (
                          <QuestionItem 
                            key={q.id} 
                            question={q} 
                            answer={answers[q.id]} 
                            onAnswer={(val) => handleAnswer(q.id, val)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mobile View (Focused One by One)
                <div className="mobile-focused-view">
                   <div className="question-counter">
                      Questão {currentCategoryQuestions.findIndex(q => q.id === currentCategoryQuestions[focusedQuestionIdx].id) + 1} de {currentCategoryQuestions.length}
                   </div>
                   
                   <div className="focused-question-card">
                      <div className="subcategory-tag">
                         {currentCategory.subcategories.find(sub => sub.questions.some(q => q.id === currentCategoryQuestions[focusedQuestionIdx].id))?.name}
                      </div>
                      <h3 className="focused-question-text">
                        {currentCategoryQuestions[focusedQuestionIdx].text}
                      </h3>

                      <div className="visual-likert-scale">
                        {[...LIKERT_SCALE].reverse().map((option) => {
                          const isSelected = answers[currentCategoryQuestions[focusedQuestionIdx].id] === option.value;
                          return (
                            <button
                              key={option.value}
                              className={`likert-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleAnswer(currentCategoryQuestions[focusedQuestionIdx].id, option.value)}
                            >
                              <div className="likert-icon-wrapper">
                                {LIKERT_ICONS[option.value]}
                              </div>
                              <span className="likert-label-text">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <footer className="evaluation-footer">
          <div className="footer-status">
            {showError && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={14} />
                <span>Responda a todas as questões para avançar</span>
              </motion.div>
            )}
          </div>
          
          <div className="footer-actions">
            <button 
              type="button" 
              className="btn-nav btn-prev" 
              onClick={prevCategory}
              disabled={currentCategoryIdx === 0 && (!isMobile || focusedQuestionIdx === 0)}
            >
              <ChevronLeft size={24} />
              <span>Voltar</span>
            </button>

            {isMobile && focusedQuestionIdx < currentCategoryQuestions.length - 1 ? (
               <button 
                type="button" 
                className="btn-nav btn-next-mini" 
                onClick={() => setFocusedQuestionIdx(prev => prev + 1)}
                disabled={answers[currentCategoryQuestions[focusedQuestionIdx].id] === undefined}
              >
                <span>Próxima</span>
                <ChevronRight size={20} />
              </button>
            ) : currentCategoryIdx < MEEGA_QUESTIONS.length - 1 ? (
              <button 
                type="button" 
                className="btn-nav btn-primary" 
                onClick={nextCategory}
              >
                <span>Próxima Etapa</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-nav btn-submit" 
                onClick={handleSubmit}
                disabled={isSubmitting || !isComplete}
              >
                {isSubmitting ? 'Enviando...' : 'Finalizar'}
                {!isSubmitting && <Sparkles size={20} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

const QuestionItem = ({ question, answer, onAnswer }) => {
  const isAnswered = answer !== undefined;
  
  return (
    <motion.div 
      className={`question-item ${isAnswered ? 'answered' : ''}`}
    >
      <p className="question-text">{question.text}</p>
      <div className="likert-options">
        {LIKERT_SCALE.map((option) => {
          const isSelected = answer === option.value;
          return (
            <label 
              key={option.value} 
              className={`likert-label ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`q_${question.id}`}
                value={option.value}
                checked={isSelected}
                onChange={() => onAnswer(option.value)}
              />
              <div className="likert-icon-mini">
                {LIKERT_ICONS[option.value]}
              </div>
              <span className="likert-text">{option.label}</span>
            </label>
          );
        })}
      </div>
    </motion.div>
  );
};

