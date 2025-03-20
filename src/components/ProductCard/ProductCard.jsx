import React, { useState } from "react";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = Object.values(product.images);

  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prevImage) => (prevImage - 1 + images.length) % images.length
    );
  };

  return (
    <div className="product-card">
      <div className="image-carousel">
        <button onClick={prevImage}></button>
        <img src={images[currentImage]} alt={product.name} />
        <button onClick={nextImage}></button>
      </div>
      <h2>{product.name}</h2>
      <div className="presentations">
        <h3>Presentaciones:</h3>
        <ul>
          {product.presentations.map((presentation) => (
            <li key={presentation._id}>
              {presentation.name} - {presentation.type}
            </li>
          ))}
        </ul>
      </div>
      <div className="categories">
        <h3>Categorias:</h3>
        <ul>
          {product.categories.map((category) => (
            <li key={category._id}>{category.name}</li>
          ))}
        </ul>
      </div>
      {product.descriptions && (
        <div className="descriptions">
          <h3>Descripciones:</h3>
          <ul>
            {Object.keys(product.descriptions).map((key, index) => (
              <li key={index}>{product.descriptions[key]}</li>
            ))}
          </ul>
        </div>
      )}
      {product.uses && (
        <div className="uses">
          <h3>Usos:</h3>
          <ul>
            {Object.keys(product.uses).map((key, index) => (
              <li key={index}>{product.uses[key]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductCard;