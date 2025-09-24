import React from 'react';
import BasePopupCard from '../../Shared/BasePopupCard';

const PresentationPopupCard = ({ 
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
            type="presentation"
        />
    );
};

export default PresentationPopupCard;