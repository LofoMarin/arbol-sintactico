/* FUNCIONES DE AYUDA */
// Para obtener los simbolos del cuerpo
function simbolos_del_cuerpo(cuerpo) {
  return cuerpo.match(/[A-Z]'*|./g) || [];
}

// Para saber si es terminal o no
function es_terminal(simbolo) {
  return !/[A-Z]'*/.test(simbolo);
}

// Extraer los terminales de la gramatica
function terminales(gramatica) {
  const simbolos_t = new Set();

  for (const [cabecera, cuerpos] of gramatica) {
    for (const cuerpo of cuerpos) {
      for (const simbolo of simbolos_del_cuerpo(cuerpo)) {
        if (es_terminal(simbolo) && simbolo !== "&") {
          simbolos_t.add(simbolo);
        }
      }
    }
  }

  return simbolos_t;
}

/* RESTO DE FUNCIONES */
// Construir gramatica, quitar recursividad y factorizar
function gramatica_modificada(gramatica_inicial) {
  const gramatica = new Map();

  // Generar un nuevo simbolo no terminal basado en el derivado
  function nuevo_simbolo(cabecera) {
    let simbolo = cabecera + "'";

    while (gramatica.has(simbolo)) {
      simbolo = simbolo + "'";
    }

    return simbolo;
  }

  // Agregar producciones a la gramatica
  function agregar(cabecera, cuerpo) {
    if (!gramatica.has(cabecera)) {
      gramatica.set(cabecera, []);
    }

    const cuerpos = gramatica.get(cabecera);

    // Verifica si el cuerpo ya existe antes de agregarlo
    if (!cuerpos.includes(cuerpo)) {
      cuerpos.push(cuerpo);
    }
  }

  // Inicializa la gramatica en objetos entendibles y organizados
  function inicializar() {
    const lineas = gramatica_inicial
      .split("\n")
      .filter((linea) => linea.trim() !== "");

    for (const linea of lineas) {
      const [cabecera, cuerpo] = linea.split("->").map((parte) => parte.trim());

      agregar(cabecera, cuerpo);
    }
  }

  // Quita la recursividad a izquierda
  function quitar_recursividad() {
    for (const [cabecera, cuerpos] of gramatica) {
      let alfa = [],
        beta = [];

      let recursividad = false;

      for (const cuerpo of cuerpos) {
        const simbolos = simbolos_del_cuerpo(cuerpo);

        if (simbolos[0] === cabecera) {
          // Hay recursividad
          recursividad = true;

          // alfa (los que acompañan al no terminal recursivo)
          alfa.push(simbolos.slice(1).join(""));
        } else {
          // beta (lo demas)
          beta.push(cuerpo);
        }
      }

      // Si no hay recursividad, continuar a otra cabecera
      if (!recursividad) continue;

      // Borrar las producciones viejas
      gramatica.set(cabecera, []);

      // Nuevo no terminal derivado del anterior
      let nuevo_no_terminal = nuevo_simbolo(cabecera);

      // Agregar las nuevas
      if (beta.length === 0) {
        agregar(cabecera, nuevo_no_terminal);
      }

      // Para beta
      for (const parte of beta) {
        if (parte !== "&") {
          agregar(cabecera, parte + nuevo_no_terminal);
        } else {
          agregar(cabecera, nuevo_no_terminal);
        }
      }

      // Para alfa
      for (const parte of alfa) {
        agregar(nuevo_no_terminal, parte + nuevo_no_terminal);
      }

      // Agregar epsilon para alfa
      agregar(nuevo_no_terminal, "&");
    }
  }

  // Factorizar
  function factorizar() {
    function prefijo(cuerpos) {
      const factor_comun = (str1, str2) => {
        let i = 0;
        while (i < str1.length && i < str2.length && str1[i] === str2[i]) i++;
        return str1.slice(0, i);
      };

      let factor = null;
      let factorizados = [];
      const no_factorizados = [...cuerpos];

      for (let i = 0; i < cuerpos.length && !factor; i++) {
        for (let j = i + 1; j < cuerpos.length; j++) {
          const prefix = factor_comun(cuerpos[i], cuerpos[j]);
          if (prefix) {
            factor = prefix;
            factorizados = cuerpos
              .filter((cuerpo) => cuerpo.startsWith(prefix))
              .map((cuerpo) => cuerpo.slice(prefix.length));
            factorizados.forEach((factorizado) =>
              no_factorizados.splice(
                no_factorizados.indexOf(prefix + factorizado),
                1
              )
            );
            break;
          }
        }
      }

      return {
        factor,
        factorizados,
        no_factorizados,
      };
    }

    for (const [cabecera] of gramatica) {
      // Factorizar
      while (true) {
        const cuerpos = gramatica.get(cabecera);

        const resultado = prefijo(cuerpos);

        // Si no hay mas que factorizar
        if (resultado.factor === null) {
          break;
        }

        // Eliminar viejas producciones
        gramatica.set(cabecera, []);

        // Dejar los cuerpos no factorizados tal cual
        resultado.no_factorizados.forEach((cuerpo) => {
          agregar(cabecera, cuerpo);
        });

        // Agregar nuevo simbolo
        let nuevo_no_terminal = nuevo_simbolo(cabecera);

        agregar(cabecera, resultado.factor + nuevo_no_terminal);

        // Agregar nuevas producciones
        resultado.factorizados.forEach((cuerpo) => {
          if (cuerpo === "") agregar(nuevo_no_terminal, "&");
          else agregar(nuevo_no_terminal, cuerpo);
        });
      }
    }
  }

  inicializar();
  quitar_recursividad();
  factorizar();

  return gramatica;
}

// Sacar el primero de un cuerpo
function PRIMERO(gramatica, cuerpo) {
  let primero = new Set();
  let final = true;

  // Recorrer cada simbolo del cuerpo
  for (const simbolo of simbolos_del_cuerpo(cuerpo)) {
    let X = simbolo;

    // 1ra y 2da REGLA: caso base con un terminal o epsilon
    if (es_terminal(X)) {
      primero.add(X);
      final = false;
      break;
    }

    // 3ra REGLA: caso recursivo
    const cuerpos = gramatica.get(X);
    let epsilon = false; // Si hay epsilon en el caso recursivo

    for (const _cuerpo of cuerpos) {
      let _primero = PRIMERO(gramatica, _cuerpo);

      _primero.forEach((_simbolo) => primero.add(_simbolo));

      if (_primero.has("&")) epsilon = true;
    }

    if (!epsilon) {
      final = false;
      break;
    }
  }

  // Si llego al final, es decir, todo se pudo volver vacio
  if (final) {
    primero.add("&");
  }

  return primero;
}

// Saca el conjunto primeros de cada no terminal de la gramatica
function conjunto_primeros(gramatica) {
  const primeros = new Map();

  for (const [cabecera, cuerpos] of gramatica) {
    let _primeros = new Set();

    primeros.set(cabecera, _primeros);

    for (const cuerpo of cuerpos) {
      let _primero = PRIMERO(gramatica, cuerpo);
      _primero.forEach((_simbolo) => _primeros.add(_simbolo));
    }
  }

  return primeros;
}

// Sacar el siguiente de un no terminal
function SIGUIENTE(gramatica, no_terminal, memoria = new Set()) {
  let siguiente = new Set();

  // Simbolo no terminal de inicio
  const S = gramatica.keys().next().value;

  // Memoria para no caer en recursividad
  memoria.add(no_terminal);

  for (const [cabecera, cuerpos] of gramatica) {
    for (const cuerpo of cuerpos) {
      let simbolos = simbolos_del_cuerpo(cuerpo);

      for (let i = 0; i < simbolos.length; i++) {
        let simbolo = simbolos[i];

        if (simbolo === no_terminal) {
          let beta = simbolos.slice(i + 1).join("");

          // 2da REGLA: A->alfaBbeta
          let _primero = PRIMERO(gramatica, beta);

          new Set([..._primero].filter((item) => item !== "&")).forEach(
            (_simbolo) => siguiente.add(_simbolo)
          );

          // 3ra REGLA: A->alfaB o A->alfaBbeta, si beta contiene epsilon
          if (beta.length === 0 || _primero.has("&")) {
            if (!memoria.has(cabecera))
              SIGUIENTE(gramatica, cabecera, memoria).forEach((_simbolo) =>
                siguiente.add(_simbolo)
              );

            if (cabecera === S) siguiente.add("$");
          }
        }
      }
    }
  }

  return siguiente;
}

// Saca el conjunto siguientes de cada no terminal de la gramatica
function conjunto_siguientes(gramatica) {
  const siguientes = new Map();

  const S = gramatica.keys().next().value;

  for (const [cabecera, _cuerpos] of gramatica) {
    let _siguientes = new Set();

    siguientes.set(cabecera, _siguientes);

    // 1ra REGLA: Agregar $ a S
    if (cabecera === S) _siguientes.add("$");

    SIGUIENTE(gramatica, cabecera).forEach((_simbolo) =>
      _siguientes.add(_simbolo)
    );
  }

  return siguientes;
}

// Saca la tabla M
function tabla_M(gramatica, siguientes) {
  const matriz = {};

  function agregar(fila, columna, elemento) {
    if (!matriz[fila]) {
      matriz[fila] = {};
    }
    matriz[fila][columna] = elemento;
  }

  for (const [cabecera, cuerpos] of gramatica) {
    // Inicializar
    for (const terminal of terminales(gramatica)) {
      agregar(cabecera, terminal, null);
    }
    agregar(cabecera, "$", null);

    for (const cuerpo of cuerpos) {
      const primero = PRIMERO(gramatica, cuerpo);

      for (const terminal of primero) {
        if (terminal !== "&") {
          agregar(cabecera, terminal, cuerpo);
        }
      }

      if (primero.has("&")) {
        for (const terminal of siguientes.get(cabecera)) {
          agregar(cabecera, terminal, cuerpo);
        }
      }
    }
  }

  return matriz;
}

// Valida una cadena o no
function asd(tabla_M, cadena) {
  const tabla = [];
  var reconoce = false;

  const S = Object.keys(tabla_M)[0];

  tabla.push({
    pila: ["$", S],
    entrada: cadena + "$",
    salida: null,
  });

  let X, a;

  do {
    let ultima_fila = tabla.slice(-1)[0];

    X = ultima_fila.pila.slice(-1)[0];
    a = ultima_fila.entrada[0];

    const fila = {};

    if (es_terminal(X) || X === "$") {
      if (X === a) {
        fila.pila = ultima_fila.pila.slice(0, -1);
        fila.entrada = ultima_fila.entrada.slice(1);
        fila.salida = null;
      } else break;
    } else {
      if (tabla_M[X][a]) {
        let acumulado =
          tabla_M[X][a] === "&"
            ? []
            : simbolos_del_cuerpo(tabla_M[X][a]).reverse();

        fila.pila = [...ultima_fila.pila.slice(0, -1), ...acumulado];
        fila.entrada = ultima_fila.entrada;

        ultima_fila.salida = X + "->" + tabla_M[X][a];
        fila.salida = null;
      } else break;
    }

    tabla.push(fila);
  } while (X !== "$");

  for (const fila of tabla) {
    fila.pila = fila.pila.join("");
  }

  let ultima_fila = tabla.slice(-1)[0];

  // La pila esta vacia
  if (ultima_fila.pila === "" && ultima_fila.entrada === "") {
    reconoce = true;
  }

  return {
    tabla,
    reconoce,
  };
}

export const analizador = (gramatica_inicial) => {
  const gramatica = gramatica_modificada(gramatica_inicial);
  const simbolos_t = terminales(gramatica);
  const primeros = conjunto_primeros(gramatica);
  const siguientes = conjunto_siguientes(gramatica);
  const M = tabla_M(gramatica, siguientes);

  return {
    gramatica,
    primeros,
    siguientes,
    simbolos_t,
    M,
    evaluar: (cadena) => asd(M, cadena),
  };
};
