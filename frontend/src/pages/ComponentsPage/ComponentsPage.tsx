import { useReducer, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, message } from 'antd';
import { z } from 'zod';
import { ConfirmationModal } from '../../entities/ConfirmationModal';
import { ResetFiltersButton } from '../../entities/ResetFiltersButton';
import { UserPicker, type Employee } from '../../entities/UserPicker';
import { ErrorCard, LoadingCard } from '../../features/Cards';
import ElementsList from '../../features/FormItems/ui/ElementsList/ElementsList';
import FormItem from '../../features/FormItems/ui/FormItem/FormItem';
import errorAnimation404 from '../../shared/assets/animations/404_1.json';
import errorAnimation503 from '../../shared/assets/animations/503_1.json';
import { getDateRangePresets } from '../../shared/lib/datePresets';
import { zodToFormErrors } from '../../shared/lib/form/zodToFormErrors';
import Bubble from '../../shared/ui/Bubble/Bubble';
import Button from '../../shared/ui/Button/Button';
import {
  AddDepartmentCard,
  AddLaboratoryCard,
  DepartmentCard,
  LaboratoryCard,
} from '../../shared/ui/Cards';
import {
  DatePicker,
  FormWrapper,
  Input,
  InputText,
  RangePicker,
  RadioGroup,
  Select,
} from '../../shared/ui/FormItems';
import Layout from '../../shared/ui/Layout/Layout';
import { Modal } from '../../shared/ui/Modal';
import Tooltip from '../../shared/ui/Tooltip/Tooltip';
import Tour from '../../shared/ui/Tour/Tour';
import { NavigationBar } from '../../widgets/NavigationBar';
import { UserInfo } from '../../widgets/UserInfo';
import './ComponentsPage.css';

const componentsFormSchema = z.object({
  exampleField: z.string().min(1, 'Обязательное поле').regex(/^\d+$/, 'Введите только цифры'),
  elements: z
    .array(z.object({ name: z.string().optional(), checkbox: z.boolean().optional() }))
    .optional(),
  example: z.union([z.string(), z.number()]).optional(),
});

interface ComponentsPageState {
  modalOpen: boolean;
  loadingCardLoading: boolean;
  tourOpen: boolean;
  confirmationModalOpen: boolean;
  selectedEmployee: Employee | null;
}

type ComponentsPageAction =
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_LOADING_CARD_LOADING'; payload: boolean }
  | { type: 'SET_TOUR_OPEN'; payload: boolean }
  | { type: 'SET_CONFIRMATION_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_EMPLOYEE'; payload: Employee | null };

const initialState: ComponentsPageState = {
  modalOpen: false,
  loadingCardLoading: false,
  tourOpen: false,
  confirmationModalOpen: false,
  selectedEmployee: null,
};

function componentsPageReducer(
  state: ComponentsPageState,
  action: ComponentsPageAction
): ComponentsPageState {
  switch (action.type) {
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.payload };
    case 'SET_LOADING_CARD_LOADING':
      return { ...state, loadingCardLoading: action.payload };
    case 'SET_TOUR_OPEN':
      return { ...state, tourOpen: action.payload };
    case 'SET_CONFIRMATION_MODAL_OPEN':
      return { ...state, confirmationModalOpen: action.payload };
    case 'SET_SELECTED_EMPLOYEE':
      return { ...state, selectedEmployee: action.payload };
    default:
      return state;
  }
}

const ComponentsPage = () => {
  const [state, dispatch] = useReducer(componentsPageReducer, initialState);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tourButtonRef = useRef<HTMLDivElement>(null);
  const tourCardRef = useRef<HTMLDivElement>(null);

  const handleResetFilters = () => {
    console.log('Фильтры сброшены');
  };

  const handleCheckZod = () => {
    const values = form.getFieldsValue();
    const result = componentsFormSchema.safeParse(values);
    if (!result.success) {
      form.setFields(zodToFormErrors(result.error));
      message.warning('Исправьте ошибки в форме');
      return;
    }
    clearZodFormErrors(form);
    message.success('Валидация успешно пройдена');
  };

  const clearZodFormErrors = (f: ReturnType<typeof Form.useForm>[0]) => {
    const err = f.getFieldsError();
    const namesToClear: (string | number)[][] = [['exampleField']];
    if (Array.isArray(err)) {
      for (const e of err) {
        if (e?.errors?.length && e?.name) {
          namesToClear.push(e.name as (string | number)[]);
        }
      }
    }
    f.setFields(namesToClear.map(name => ({ name, errors: [] as string[] })));
  };

  return (
    <Layout title="Путеводитель по компонентам">
      <LoadingCard loading={state.loadingCardLoading} />
      <div className="components-page-content">
        {/* Shared UI Components */}
        <section className="components-section">
          <h3 className="section-title">Shared UI Components</h3>
          <div className="components-grid">
            <div className="component-card">
              <h4>Button</h4>
              <Button title="Пример кнопки" type="primary" />
            </div>

            <div className="component-card">
              <h4>Bubble</h4>
              <Bubble text="Пример Bubble" />
            </div>

            <div className="component-card">
              <h4>Tooltip</h4>
              <Tooltip {...{ title: 'Пример подсказки' }}>
                <span
                  role="button"
                  tabIndex={0}
                  style={{ color: '#000' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                  }}
                >
                  Наведите на меня
                </span>
              </Tooltip>
            </div>

            <div className="component-card" ref={tourCardRef}>
              <h4>Tour</h4>
              <div ref={tourButtonRef}>
                <Button
                  title="Запустить тур"
                  onClick={() => dispatch({ type: 'SET_TOUR_OPEN', payload: true })}
                />
              </div>
              <Tour
                open={state.tourOpen}
                onClose={() => dispatch({ type: 'SET_TOUR_OPEN', payload: false })}
                steps={[
                  {
                    title: 'Добро пожаловать!',
                    description:
                      'Это пример использования компонента Tour. Он помогает создавать интерактивные туры по интерфейсу.',
                    target: () => tourButtonRef.current || document.body,
                  },
                  {
                    title: 'Компоненты',
                    description:
                      'На этой странице представлены все компоненты из директорий shared, features и widgets.',
                    target: () => tourCardRef.current || document.body,
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Shared Cards */}
        <section className="components-section">
          <h3 className="section-title">Shared Cards</h3>
          <div className="components-grid">
            <div className="component-card">
              <h4>LaboratoryCard</h4>
              <LaboratoryCard
                laboratory={{
                  name: 'Пример лаборатории',
                  description: 'Описание лаборатории',
                  full_name: 'Полное название лаборатории',
                  laboratory_location: 'Москва, ул. Примерная, д. 1',
                }}
                onClick={() => console.log('Clicked')}
              />
            </div>

            <div className="component-card">
              <h4>DepartmentCard</h4>
              <DepartmentCard
                department={{
                  name: 'Пример отдела',
                  laboratory_location: 'Москва, ул. Примерная, д. 1',
                }}
                iconIndex={0}
                onClick={() => console.log('Clicked')}
              />
            </div>

            <div className="component-card">
              <h4>AddLaboratoryCard</h4>
              <AddLaboratoryCard onClick={() => console.log('Add laboratory')} />
            </div>

            <div className="component-card">
              <h4>AddDepartmentCard</h4>
              <AddDepartmentCard onClick={() => console.log('Add department')} />
            </div>
          </div>
        </section>

        {/* Shared Form Items */}
        <section className="components-section">
          <h3 className="section-title">Shared Form Items</h3>
          <div className="components-grid">
            <div className="component-card">
              <h4>FormWrapper</h4>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Обертка для элементов формы, обеспечивающая единообразное оформление
              </p>
              <FormWrapper>
                <InputText placeholder="Введите текст" rows={2} />
              </FormWrapper>
            </div>

            <div className="component-card">
              <h4>Input</h4>
              <Input placeholder="Введите текст" />
            </div>

            <div className="component-card">
              <h4>InputText</h4>
              <InputText placeholder="Текстовое поле (TextArea)" rows={2} />
            </div>

            <div className="component-card">
              <h4>RadioGroup</h4>
              <Form form={form}>
                <RadioGroup
                  data={[
                    { name: 'Вариант 1', value: '1' },
                    { name: 'Вариант 2', value: '2' },
                    { name: 'Вариант 3', value: '3' },
                  ]}
                  name="example"
                />
              </Form>
            </div>

            <div className="component-card">
              <h4>Select</h4>
              <Select
                options={[
                  { label: 'Опция 1', value: '1' },
                  { label: 'Опция 2', value: '2' },
                ]}
                placeholder="Выберите опцию"
                style={{ width: '100%' }}
              />
            </div>

            <div className="component-card">
              <h4>DatePicker</h4>
              <p className="component-card-description">
                Выбор одной даты с маской DD.MM.YYYY и русской локалью.
              </p>
              <DatePicker placeholder="Выберите дату" style={{ width: '100%' }} />
            </div>

            <div className="component-card">
              <h4>RangePicker (с пресетами)</h4>
              <p className="component-card-description">
                Выбор диапазона дат с быстрыми пресетами: сегодня, неделя, месяц, кварталы и др.
              </p>
              <RangePicker
                placeholder={['От', 'До']}
                presets={getDateRangePresets()}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </section>

        {/* Shared Modal */}
        <section className="components-section">
          <h3 className="section-title">Shared Modal</h3>
          <div className="components-grid">
            <div className="component-card">
              <h4>Modal</h4>
              <Button
                title="Открыть модальное окно"
                onClick={() => dispatch({ type: 'SET_MODAL_OPEN', payload: true })}
              />
              {state.modalOpen && (
                <Modal
                  header="Пример модального окна"
                  onClose={() => dispatch({ type: 'SET_MODAL_OPEN', payload: false })}
                  onSave={() => {
                    console.log('Saved');
                    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
                  }}
                  saveButtonText="Сохранить"
                >
                  <p>Это пример модального окна. Здесь может быть любой контент.</p>
                </Modal>
              )}
            </div>
          </div>
        </section>

        {/* Entities Components */}
        <section className="components-section">
          <h3 className="section-title">Entities Components</h3>
          <div className="components-grid">
            <div className="component-card">
              <h4>ConfirmationModal</h4>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Базовая модалка подтверждения, использующая базовую модалку из shared/ui/Modal.
                Предназначена для запроса подтверждения действий пользователя.
              </p>
              <Button
                title="Открыть модалку подтверждения"
                onClick={() => dispatch({ type: 'SET_CONFIRMATION_MODAL_OPEN', payload: true })}
              />
              <ConfirmationModal
                open={state.confirmationModalOpen}
                title="Подтверждение действия"
                message="Вы уверены, что хотите выполнить это действие?"
                confirmText="Подтвердить"
                cancelText="Отмена"
                onConfirm={() => {
                  console.log('Действие подтверждено');
                  dispatch({ type: 'SET_CONFIRMATION_MODAL_OPEN', payload: false });
                }}
                onCancel={() => dispatch({ type: 'SET_CONFIRMATION_MODAL_OPEN', payload: false })}
                style={{ width: '400px', maxWidth: '90vw' }}
              />
            </div>
            <div className="component-card">
              <h4>UserPicker</h4>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Поле выбора сотрудника с поиском по ФИО (минимум 3 символа).
              </p>
              <div style={{ maxWidth: 360 }}>
                <UserPicker
                  value={state.selectedEmployee}
                  onChange={emp => dispatch({ type: 'SET_SELECTED_EMPLOYEE', payload: emp })}
                  placeholder="Введите ФИО сотрудника"
                />
              </div>
            </div>
            <div className="component-card">
              <h4>ResetFiltersButton</h4>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Кнопка для сброса фильтров и очистки URL параметров. Добавьте параметры в URL
                (например: ?filter=test&page=2), затем нажмите кнопку для их сброса.
              </p>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  Текущие URL параметры:
                </p>
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {searchParams.toString() || '(нет параметров)'}
                </div>
              </div>
              <ResetFiltersButton onReset={handleResetFilters} />
            </div>
          </div>
        </section>

        {/* Features Components */}
        <section className="components-section">
          <h3 className="section-title">Features Components</h3>
          <div className="components-grid">
            <div className="component-card" style={{ gridColumn: '1 / -1' }}>
              <h4>ErrorCard (404)</h4>
              <ErrorCard
                title="Ошибка"
                text="Пример отображения ошибки 404"
                animation={errorAnimation404}
              />
            </div>

            <div className="component-card" style={{ gridColumn: '1 / -1' }}>
              <h4>ErrorCard (503)</h4>
              <ErrorCard
                title="Ошибка"
                text="Пример отображения ошибки 503"
                animation={errorAnimation503}
              />
            </div>

            <div className="component-card">
              <h4>LoadingCard</h4>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Компонент для отображения состояния загрузки. Перекрывает весь контент Layout.
              </p>
              <Button
                title="Показать загрузку"
                onClick={() => {
                  dispatch({ type: 'SET_LOADING_CARD_LOADING', payload: false });
                  setTimeout(() => {
                    dispatch({ type: 'SET_LOADING_CARD_LOADING', payload: true });
                  }, 10);
                }}
              />
            </div>

            <div className="component-card" style={{ gridColumn: 'span 2' }}>
              <h4>ElementsList</h4>
              <Form form={form}>
                <ElementsList
                  formName="elements"
                  formData={[
                    { name: 'Иван Иванов', email: 'ivan@example.com' },
                    { name: 'Петр Петров', email: 'petr@example.com' },
                  ]}
                />
              </Form>
            </div>

            <div className="component-card">
              <h4>FormItem + проверка Zod</h4>
              <Form
                form={form}
                onValuesChange={(_, allValues) => {
                  const result = componentsFormSchema.safeParse(allValues);
                  if (result.success) {
                    clearZodFormErrors(form);
                  }
                }}
              >
                <FormItem
                  title="Название поля"
                  tooltip="Это подсказка для поля"
                  name="exampleField"
                >
                  <InputText placeholder="Введите значение" rows={2} />
                </FormItem>
                <Button title="Проверить Zod" type="primary" onClick={handleCheckZod} />
              </Form>
            </div>
          </div>
        </section>

        {/* Widgets */}
        <section className="components-section">
          <h3 className="section-title">Widgets</h3>
          <div className="components-grid">
            <div className="component-card" style={{ gridColumn: 'span 2' }}>
              <h4>NavigationBar</h4>
              <NavigationBar
                breadcrumbs={[
                  { label: 'Главная', onClick: () => navigate('/') },
                  { label: 'Компоненты' },
                ]}
                showBack={true}
                onBack={() => navigate('/')}
              />
            </div>

            <div className="component-card" style={{ gridColumn: 'span 2' }}>
              <h4>UserInfo</h4>
              <UserInfo
                userCabinet={{
                  id: 1,
                  hsnils: '12345678901',
                  employee_full_name: 'Иванов Иван Иванович',
                  employee_department: 'Отдел разработки',
                  employee_division: 'Инженер-программист',
                }}
                employeeData={{
                  fullName: 'Иванов Иван Иванович',
                  department: 'Отдел разработки',
                  division: 'СИУС',
                  jobTitle: 'Инженер-программист',
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComponentsPage;
