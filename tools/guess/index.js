const getFontSize = (textLength) => {
    const baseSize = 9
    if (textLength >= baseSize) {
      textLength = baseSize - 2
    }
    const fontSize = baseSize - textLength
    return `${fontSize}px`
  }
  
  const boxes = document.querySelectorAll('.box p')
    
  boxes.forEach(box => {
    box.style.fontSize = getFontSize(box.textContent.length)
  });