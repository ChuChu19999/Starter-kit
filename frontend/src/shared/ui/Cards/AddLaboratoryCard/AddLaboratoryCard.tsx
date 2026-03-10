import { PlusOutlined } from '@ant-design/icons';
import './AddLaboratoryCard.css';

interface AddLaboratoryCardProps {
  onClick?: () => void;
}

const handleKeyDown = (e: React.KeyboardEvent, onClick?: () => void) => {
  if ((e.key === 'Enter' || e.key === ' ') && onClick) {
    e.preventDefault();
    onClick();
  }
};

const AddLaboratoryCard = ({ onClick }: AddLaboratoryCardProps) => {
  return (
    <div
      className="add-laboratory-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => handleKeyDown(e, onClick)}
    >
      <div className="add-laboratory-card-content">
        <PlusOutlined className="add-laboratory-icon" />
        <h3>Добавить лабораторию</h3>
      </div>
    </div>
  );
};

export default AddLaboratoryCard;
