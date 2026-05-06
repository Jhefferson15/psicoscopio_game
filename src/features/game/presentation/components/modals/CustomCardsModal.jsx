import { motion } from 'framer-motion';
import CustomCardsGallery from '../CustomCardsGallery';

const CustomCardsModal = ({ onClose }) => (
  <motion.div 
    className="collection-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="collection-modal-content"
      initial={{ scale: 0.9, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 50 }}
      onClick={e => e.stopPropagation()}
    >
      <CustomCardsGallery isModal={true} onClose={onClose} />
    </motion.div>
  </motion.div>
);

export default CustomCardsModal;
