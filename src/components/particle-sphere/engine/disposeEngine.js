export const disposeEngine = ({ renderer, scene }) => {
  if (scene) {
    scene.traverse((object) => {
      if (!object.isMesh && !object.isPoints && !object.isLine) {
        return;
      }

      object.geometry?.dispose();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        material?.dispose();
      });
    });

    scene.clear();
  }

  if (renderer) {
    renderer.renderLists.dispose();
    renderer.dispose();
  }
};
