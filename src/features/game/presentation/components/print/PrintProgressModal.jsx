import { motion, AnimatePresence } from 'framer-motion';
import '../MenuModals.css';
import { FileDown } from 'lucide-react';

const PrintProgressModal = ({ isOpen, progress }) => {
  return (
    <div className="print-progress-overlay">
       <motion.div 
         className="print-progress-content"
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
       >
         <div className="progress-header">
           <div className="progress-icon-wrapper">
             <FileDown className="text-primary pulse-animation" size={32} />
           </div>
           <h3>Gerando seu Kit de Jogo</h3>
           <p>Estamos preparando as páginas em alta resolução. Por favor, aguarde um momento.</p>
         </div>
         
         <div className="progress-bar-container">
           <motion.div 
             className="progress-bar-fill" 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.3 }}
           />
         </div>
         
         <div className="progress-stats">
           <span className="percentage">{progress}%</span>
           <span className="status-text">
             {progress < 10 ? 'Inicializando componentes...' : 
              progress < 90 ? `Capturando página ${Math.floor((progress - 10) / 80 * 16) + 1}...` : 
              progress < 100 ? 'Compilando arquivo final...' : 'Download iniciado!'}
           </span>
         </div>
       </motion.div>
    </div>
  );
};

export default PrintProgressModal;
