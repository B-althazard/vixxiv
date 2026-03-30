export function buildPrompt(values) {
  const {
    imageStyle, cameraSettings, perspective, lighting,
    hairStyle, eyes, face, lips, makeup,
    bodyType, bust, ass, realismLevel,
    clothingStyle, material, pussy, cum, pose
  } = values;

  let parts = [];

  parts.push(imageStyle);
  parts.push(cameraSettings);
  parts.push(perspective);
  parts.push(lighting);
  parts.push(`a whore with ${hairStyle}, ${eyes}, ${face}, ${lips}, ${makeup}`);
  parts.push(`${bodyType} with ${bust} and ${ass}`);

  if (clothingStyle !== 'completely naked whore') {
    if (material && material !== 'none') {
      parts.push(`wearing ${clothingStyle} made of ${material}`);
    } else {
      parts.push(`wearing ${clothingStyle}`);
    }
  } else {
    parts.push('completely naked');
  }

  parts.push(pussy);
  if (cum !== 'clean whore') {
    parts.push(cum);
  }
  parts.push(pose);

  const level = parseInt(realismLevel) || 10;
  if (level >= 9) {
    parts.push('100% realistic, photorealistic, hyperrealistic, raw photography, no digital art');
  } else if (level >= 7) {
    parts.push('highly realistic, photographic, authentic');
  } else {
    parts.push('realistic, photographic');
  }

  parts.push('sharp focus, high resolution, detailed skin texture, natural lighting, professional photography');

  return parts.join(', ');
}

export function getStats(prompt) {
  const words = prompt.trim().split(/\s+/).length;
  const chars = prompt.length;
  const tags = (prompt.match(/,/g) || []).length;
  return { words, chars, tags };
}
