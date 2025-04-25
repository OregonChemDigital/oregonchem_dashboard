import React from 'react';
import BaseCard from './BaseCard';

const ProductCard = ({ product, onUpdate, onDelete, showDelete = false }) => {
    const handleClick = () => {
        // Open product details modal or navigate to product page
        console.log('Product clicked:', product);
    };

    const customContent = (
        <div className="product-details">
            {product.presentations && product.presentations.length > 0 && (
                <p>Presentaciones: {product.presentations.length}</p>
            )}
            {product.categories && product.categories.length > 0 && (
                <p>Categorías: {product.categories.length}</p>
            )}
            {product.description && (
                <p className="description">{product.description}</p>
            )}
        </div>
    );

    return (
        <BaseCard
            item={product}
            imageUrl={product.images && Object.keys(product.images).length > 0 ? 
                Object.values(product.images)[0] : null}
            title={product.name}
            subtitle={product.code}
            customContent={customContent}
            onUpdate={onUpdate}
            onDelete={onDelete}
            showDelete={showDelete}
            onClick={handleClick}
        />
    );
};

export default ProductCard; 