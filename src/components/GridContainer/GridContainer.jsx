import React, { useState } from 'react';
import { FaTh, FaList, FaSort, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useViewMode } from '../../contexts/ViewModeContext';
import ProductPopupCard from '../PopupCards/ProductPopupCard/ProductPopupCard';
import PresentationPopupCard from '../PopupCards/PresentationPopupCard/PresentationPopupCard';
import CategoryPopupCard from '../PopupCards/CategoryPopupCard/CategoryPopupCard';
import BannerPopupCard from '../PopupCards/BannerPopupCard/BannerPopupCard';
import '../../styles/ActionButtons.css';
import './GridContainer.css';

const GridContainer = ({ 
  title, 
  children, 
  sortOption, 
  onSortChange,
  showControls = true,
  customControls,
  onSearch,
  renderListHeader,
  renderListRow,
  listView = false
}) => {
  const { viewMode, setViewMode } = useViewMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const handleUpdate = (item) => {
    if (children.props.onUpdate) {
      children.props.onUpdate(item);
    }
  };

  const handleDelete = (item) => {
    if (children.props.onDelete) {
      children.props.onDelete(item);
    }
  };

  const renderPopup = () => {
    if (!isPopupOpen || !selectedItem) return null;

    const popupProps = {
      isOpen: isPopupOpen,
      onClose: handleClosePopup,
      item: selectedItem,
      title: selectedItem.name,
      onUpdate: handleUpdate,
      onDelete: handleDelete
    };

    switch (selectedItem.type) {
      case 'product':
        return <ProductPopupCard {...popupProps} />;
      case 'presentation':
        return <PresentationPopupCard {...popupProps} />;
      case 'category':
        return <CategoryPopupCard {...popupProps} />;
      case 'banner':
        return <BannerPopupCard {...popupProps} />;
      default:
        return null;
    }
  };

  const defaultRenderListHeader = () => {
    return (
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Fecha de Creación</th>
          <th>Última Actualización</th>
          <th>Acciones</th>
        </tr>
      </thead>
    );
  };

  const defaultRenderListRow = (child) => {
    if (!React.isValidElement(child)) return null;
    const { item } = child.props;
    return (
      <tr 
        key={item._id}
        className={getTypeClass(item.type)}
        onClick={() => handleItemClick(item)}
        style={{ cursor: 'pointer' }}
      >
        <td>{item.name}</td>
        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
        <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
        <td>
          <div className="action-buttons">
            {child.props.onUpdate && (
              <button 
                className="edit-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  child.props.onUpdate(item);
                }}
                title="Actualizar"
              >
                <FaEdit />
              </button>
            )}
            {child.props.showDelete && child.props.onDelete && (
              <button 
                className="delete-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  child.props.onDelete(item);
                }}
                title="Eliminar"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const getTypeClass = (type) => {
    if (!type) return '';
    return type.toLowerCase() === 'solido' ? 'type-solid' : 'type-liquid';
  };

  return (
    <div className="grid-container">
      <div className="grid-header">
        <h2>{title}</h2>
        {showControls && (
          <div className="grid-controls">
            <div className="search-control">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="view-controls">
              <button
                className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista de Lista"
              >
                <FaList />
              </button>
              <button
                className={`toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista de Tarjetas"
              >
                <FaTh />
              </button>
            </div>
            <div className="sort-control">
              <FaSort className="sort-icon" />
              <select
                className="sort-dropdown"
                value={sortOption}
                onChange={onSortChange}
              >
                <option value="name-asc">A - Z</option>
                <option value="name-desc">Z - A</option>
                <option value="created-asc">Antiguo - Reciente</option>
                <option value="created-desc">Reciente - Antiguo</option>
                <option value="updated-asc">Primera actualización - Última actualización</option>
                <option value="updated-desc">Última actualización - Primera actualización</option>
              </select>
            </div>
          </div>
        )}
      </div>
      {viewMode === 'grid' ? (
        <div className="grid">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onClick: handleItemClick
              });
            }
            return child;
          })}
        </div>
      ) : (
        <div className="list">
          <table>
            {renderListHeader ? renderListHeader() : defaultRenderListHeader()}
            <tbody>
              {React.Children.map(children, child => {
                if (renderListRow) {
                  return renderListRow(child, handleItemClick);
                }
                return defaultRenderListRow(child);
              })}
            </tbody>
          </table>
        </div>
      )}
      {renderPopup()}
    </div>
  );
};

export default GridContainer; 