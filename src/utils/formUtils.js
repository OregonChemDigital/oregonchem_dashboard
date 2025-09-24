// Shared form utilities and helpers

// Generic toggle selection function
export const toggleSelection = (array, setArray, itemId) => {
  setArray((prev) =>
    prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
  );
};

// Generic array change handler
export const handleArrayChange = (array, setArray, index, value) => {
  setArray((prev) => {
    const updatedArray = [...prev];
    updatedArray[index] = value;
    return updatedArray;
  });
};

// Image upload handler
export const handleImageUpload = (event, index, setImages, setErrors) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setErrors({ images: "Please upload an image file" });
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setImages((prev) => {
    const updated = [...prev];
    updated[index] = { file, previewUrl, aiGenerated: false, templateId: null };
    return updated;
  });
};

// Form validation helpers
export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateArrayNotEmpty = (array, fieldName) => {
  if (!array || array.length === 0) {
    return `Please select at least one ${fieldName}`;
  }
  return null;
};

// Site-specific validation
export const validateSiteSpecificFields = (frontends, descriptions, uses, frontendOptions) => {
  const errors = {};
  
  frontends.forEach((frontend, index) => {
    const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
    const siteLabel = frontendOptions[frontendIndex]?.label || frontend;
    
    if (!descriptions[frontendIndex]?.trim()) {
      errors[`description${frontendIndex}`] = `Description for ${siteLabel} is required`;
    }
    if (!uses[frontendIndex]?.trim()) {
      errors[`use${frontendIndex}`] = `Use for ${siteLabel} is required`;
    }
  });
  
  return errors;
};

// Form data preparation helpers
export const prepareFormData = (formDataObj, selectedFrontends, descriptions, uses, prices, images) => {
  const formData = new FormData();
  
  // Basic data
  formData.append("name", formDataObj.name);
  formDataObj.presentations?.forEach(p => formData.append("presentations[]", p));
  formDataObj.templates?.forEach(t => formData.append("templates[]", t));
  formDataObj.categories.forEach(c => formData.append("categories[]", c));
  formDataObj.frontends.forEach(f => formData.append("frontends[]", f));

  // Site-specific data
  selectedFrontends.forEach((frontend) => {
    const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
    
    formData.append(`descriptions[${frontend}]`, descriptions[frontendIndex] || "");
    formData.append(`uses[${frontend}]`, uses[frontendIndex] || "");
    
    if (prices[frontendIndex] && prices[frontendIndex] !== "") {
      formData.append(`prices[${frontend}]`, prices[frontendIndex]);
    }
    
    if (images[frontendIndex]?.file) {
      formData.append(`images[${frontend}]`, images[frontendIndex].file);
    }
  });

  return formData;
};

// AI-specific form data preparation
export const prepareAIFormData = (formDataObj, selectedFrontends, descriptions, uses, prices, aiGeneratedImages, selectedGeneratedImages) => {
  const formData = new FormData();
  
  // Basic data
  formData.append("name", formDataObj.name);
  formData.append("templates", JSON.stringify(formDataObj.templates));
  formData.append("aiSettings", JSON.stringify(formDataObj.aiSettings));
  
  formDataObj.categories.forEach(c => formData.append("categories[]", c));
  formDataObj.frontends.forEach(f => formData.append("frontends[]", f));

  // Site-specific data
  selectedFrontends.forEach((frontend) => {
    const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
    
    formData.append(`descriptions[${frontend}]`, descriptions[frontendIndex] || "");
    formData.append(`uses[${frontend}]`, uses[frontendIndex] || "");
    
    if (prices[frontendIndex] && prices[frontendIndex] !== "") {
      formData.append(`prices[${frontend}]`, prices[frontendIndex]);
    }
    
    // Handle AI generated images vs regular file uploads
    const selectedImagesForFrontend = Object.values(aiGeneratedImages)
      .flat()
      .filter(img => selectedGeneratedImages.includes(img.id));
    
    if (selectedImagesForFrontend.length > 0) {
      const selectedImage = selectedImagesForFrontend[0];
      formData.append(`aiImages[${frontend}]`, JSON.stringify({
        previewUrl: selectedImage.previewUrl,
        templateId: selectedImage.templateId,
        templateName: selectedImage.templateName,
        presentacion: selectedImage.presentacion,
        aiGenerated: true
      }));
    }
  });

  return formData;
};

// Error handling utilities
export const handleApiError = (error, setErrors) => {
  console.error('API Error:', error);
  const errorMessage = error.message || 'An unexpected error occurred';
  setErrors({ submit: errorMessage });
};

// Success message helpers
export const showSuccessMessage = (message, showSuccess) => {
  if (showSuccess) {
    showSuccess(message);
  }
};

// Form reset utilities
export const resetFormState = (setters) => {
  const {
    setProductImages,
    setDescriptions,
    setUses,
    setPrices,
    setSelectedPresentations,
    setSelectedTemplates,
    setSelectedCategories,
    setSelectedFrontends,
    setProductName,
    setAiGeneratedImages,
    setSelectedImages,
    setImageLoadingStates,
    setErrors
  } = setters;

  setProductImages?.(Array(5).fill({ file: null, previewUrl: null, aiGenerated: false, templateId: null }));
  setDescriptions?.(Array(5).fill(""));
  setUses?.(Array(5).fill(""));
  setPrices?.(Array(5).fill(""));
  setSelectedPresentations?.([]);
  setSelectedTemplates?.([]);
  setSelectedCategories?.([]);
  setSelectedFrontends?.(['site1']);
  setProductName?.("");
  setAiGeneratedImages?.({});
  setSelectedImages?.({});
  setImageLoadingStates?.({});
  setErrors?.({});
};
