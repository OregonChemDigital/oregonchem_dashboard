import React from 'react';
import BasePopupCard from '../../Shared/BasePopupCard';

const ProductPopupCard = ({ 
    isOpen, 
    onClose, 
    item, 
    title, 
    onUpdate, 
    onDelete 
}) => {
    return (
        <BasePopupCard
            isOpen={isOpen}
            onClose={onClose}
            item={item}
            title={title}
            onUpdate={onUpdate}
            onDelete={onDelete}
            type="product"
        />
    );
};

export default ProductPopupCard; 