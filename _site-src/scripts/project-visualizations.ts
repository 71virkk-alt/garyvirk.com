const visualizations = document.querySelectorAll<HTMLElement>("[data-project-visualization]");

for (const visualization of visualizations) {
  const controls = visualization.querySelectorAll<HTMLInputElement>("[data-visualization-control]");
  const states = visualization.querySelectorAll<HTMLElement>("[data-visualization-state]");

  const activate = (stateId: string) => {
    let activeArtifactIds: string[] = [];

    for (const state of states) {
      const isActive = state.dataset.visualizationState === stateId;
      state.hidden = !isActive;
      if (isActive) {
        activeArtifactIds = (state.dataset.artifactIds ?? "").split(/\s+/).filter(Boolean);
      }
    }

    const evidenceCards =
      visualization.parentElement?.querySelectorAll<HTMLElement>("[data-artifact-id]") ?? [];
    for (const card of evidenceCards) {
      card.classList.toggle(
        "evidence-card--related",
        activeArtifactIds.includes(card.dataset.artifactId ?? "")
      );
    }
  };

  for (const control of controls) {
    control.addEventListener("change", () => {
      if (control.checked) activate(control.value);
    });
  }

  const selected = Array.from(controls).find((control) => control.checked);
  if (selected) activate(selected.value);
}
