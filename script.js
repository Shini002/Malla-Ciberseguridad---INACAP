fetch('ramos.json')
  .then(res => res.json())
  .then(ramos => {
    const container = document.getElementById("malla");
    const semestres = {};
    const estadoRamos = JSON.parse(localStorage.getItem("estadoRamos") || "{}");

    ramos.forEach(ramo => {
        if (!semestres[ramo.semestre]) semestres[ramo.semestre] = [];
        semestres[ramo.semestre].push(ramo);
    });

    const tarjetas = {};

    Object.keys(semestres).sort((a, b) => a - b).forEach(semestre => {
        const col = document.createElement("div");
        col.className = "semestre";

        const title = document.createElement("h3");
        title.textContent = `${semestre}° Semestre`;
        col.appendChild(title);

        semestres[semestre].forEach(ramo => {
            const card = document.createElement("div");
            card.className = "card";
            const nota = document.createElement("div");
            nota.className = "nota";

            const saved = estadoRamos[ramo.nombre];
            if (saved?.estado) {
                card.classList.add(saved.estado);
                if (saved.nota) {
                    nota.textContent = `Nota: ${saved.nota}`;
                }
            }

            const info = document.createElement("div");
            info.className = "info";
            info.textContent = `Prerrequisitos: ${ramo.prerequisitos.join(", ") || "Ninguno"}`;

            const titulo = document.createElement("strong");
            titulo.textContent = ramo.nombre;

            card.appendChild(titulo);
            card.appendChild(info);
            card.appendChild(nota);

            tarjetas[ramo.nombre] = card;

            card.addEventListener("click", () => {
                if (card.classList.contains("bloqueado")) return;

                card.classList.remove("aprobado", "reprobado", "curso");
                nota.textContent = "";

                const userNota = prompt(`Ingresa la nota de "${ramo.nombre}" (Presiona ENTER para dejar el ramo cursando)`);

                if (userNota === null) return;

                if (userNota === "") {
                    card.classList.add("curso");
                    guardar(ramo.nombre, "curso", null);
                } else {
                    const notaNum = parseFloat(userNota);
                    if (!isNaN(notaNum)) {
                        if (notaNum >= 4.0) {
                            card.classList.add("aprobado");
                            nota.textContent = `Nota: ${notaNum}`;
                            guardar(ramo.nombre, "aprobado", notaNum);
                        } else {
                            card.classList.add("reprobado");
                            nota.textContent = `Nota: ${notaNum}`;
                            guardar(ramo.nombre, "reprobado", notaNum);
                        }
                    }
                }

                actualizarDesbloqueos(ramos, tarjetas);
            });

            col.appendChild(card);
        });

        container.appendChild(col);
    });

    actualizarDesbloqueos(ramos, tarjetas);

    function guardar(nombre, estado, nota) {
        estadoRamos[nombre] = { estado, nota };
        localStorage.setItem("estadoRamos", JSON.stringify(estadoRamos));
    }

    function actualizarDesbloqueos(ramos, tarjetas) {
        ramos.forEach(ramo => {
            const card = tarjetas[ramo.nombre];
            const prereqs = ramo.prerequisitos;

            const desbloqueado = prereqs.every(pr => estadoRamos[pr]?.estado === "aprobado");

            if (!desbloqueado && prereqs.length > 0) {
                card.classList.add("bloqueado");
            } else {
                card.classList.remove("bloqueado");
            }
        });
    }
});
