import { PlusOutlined } from '@ant-design/icons';
import './AddDepartmentCard.css';

interface AddDepartmentCardProps {
  onClick?: () => void;
}

const handleKeyDown = (e: React.KeyboardEvent, onClick?: () => void) => {
  if ((e.key === 'Enter' || e.key === ' ') && onClick) {
    e.preventDefault();
    onClick();
  }
};

const AddDepartmentCard = ({ onClick }: AddDepartmentCardProps) => {
  return (
    <div
      className="add-department-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => handleKeyDown(e, onClick)}
    >
      <div className="add-department-card-content">
        <PlusOutlined className="add-department-icon" />
        <h3>Добавить подразделение</h3>
      </div>
    </div>
  );
};

export default AddDepartmentCard;
