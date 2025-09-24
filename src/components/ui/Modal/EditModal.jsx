import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import UpdateProductForm from '../Forms/UpdateProductForm';
import UpdateCategoryForm from '../Forms/UpdateCategoryForm';
import UpdatePresentationForm from '../Forms/UpdatePresentationForm';
import './EditModal.css';

const EditModal = ({ 
    isOpen, 
    onClose, 
    item, 
    itemType, 
    onSuccess 
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    console.log('EditModal props:', { isOpen, item, itemType });

    if (!isOpen || !item) return null;

    const handleClose = () => {
        if (showConfirmation) {
            setShowConfirmation(false);
        } else {
            onClose();
        }
    };

    const handleSuccess = (updatedProduct) => {
        setShowConfirmation(true);
        setTimeout(() => {
            setShowConfirmation(false);
            onClose();
            if (onSuccess) {
                onSuccess(updatedProduct);
            }
        }, 1500);
    };

    const renderForm = () => {
        switch (itemType) {
            case 'product':
                return (
                    <UpdateProductForm
                        product={item}
                        onSuccess={handleSuccess}
                    />
                );
            case 'category':
                return (
                    <UpdateCategoryForm
                        category={item}
                        onSuccess={handleSuccess}
                    />
                );
            case 'presentation':
                return (
                    <UpdatePresentationForm
                        presentation={item}
                        onSuccess={handleSuccess}
                    />
                );
            default:
                return <div>Unknown item type</div>;
        }
    };

    const getTitle = () => {
        switch (itemType) {
            case 'product':
                return `Editar Producto: ${item.name}`;
            case 'category':
                return `Editar Categoría: ${item.name}`;
            case 'presentation':
                return `Editar Presentación: ${item.name}`;
            default:
                return 'Editar Item';
        }
    };

    return (
        <div className="edit-modal-overlay" onClick={handleClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit-modal-header">
                    <h2>{getTitle()}</h2>
                    <button className="close-button" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="edit-modal-content">
                    {showConfirmation ? (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <p>¡Actualizado exitosamente!</p>
                        </div>
                    ) : (
                        renderForm()
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditModal; 