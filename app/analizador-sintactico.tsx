"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Play, Circle } from "lucide-react";
import { analizador } from "../lib/analisis";

export default function AnalizadorSintacticoMinimalista() {
  const [grammar, setGrammar] = useState("");
  const [inputString, setInputString] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [resultado, setResultado] = useState<any>(null);
  const [reconocimiento, setReconocimiento] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setGrammar(content);

        // Reset
        setResultado(null);
        setReconocimiento(null);
      };
      reader.readAsText(file);
    }
  };

  const processGrammar = () => {
    setShowResults(true);

    setResultado(analizador(grammar));
  };

  const processReconocimiento = () => {
    const resultadoReconocimiento = resultado.evaluar(inputString);
    setReconocimiento(resultadoReconocimiento);
    setStatus(resultadoReconocimiento.reconoce ? "recognized" : "notRecognized");
  };

  const getStatusColor = () => {
    switch (status) {
      case "recognized":
        return "bg-green-500";
      case "notRecognized":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8 bg-white min-h-screen">
      <div>
        <Card className="border-2 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold">
              Analizador Sintáctico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="grammar-file"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Cargar archivo de gramática
                </label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="grammar-file"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt"
                    className="hidden"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById("grammar-file")?.click()
                    }
                    className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800"
                  >
                    <Upload size={18} />
                    <span>Subir archivo</span>
                  </Button>
                  <span className="text-sm text-gray-600">
                    {grammar
                      ? "Archivo cargado"
                      : "Ningún archivo seleccionado"}
                  </span>
                </div>
              </div>
              <Textarea
                value={grammar}
                onChange={(e) => setGrammar(e.target.value)}
                placeholder="Ingrese la gramática aquí..."
                rows={5}
                className="w-full p-3 border-2 border-black rounded-none"
              />
              <Button
                onClick={processGrammar}
                className="w-full bg-black text-white hover:bg-gray-800 rounded-none"
              >
                Procesar Gramática
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {resultado && (
        <>
          <div>
            <Card className="border-2 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-semibold">
                  Gramática Procesada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={Array.from(
                    resultado.gramatica as Map<string, string[]>
                  )
                    .map(([key, value]) =>
                      value
                        .map((element: string) => `${key} -> ${element}`)
                        .join("\n")
                    )
                    .join("\n")}
                  rows={5}
                  readOnly
                  className="w-full p-3 border-2 border-black rounded-none"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-semibold">
                  Conjuntos PRIMERO y SIGUIENTE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold border-b-2 border-black">
                        No Terminal
                      </TableHead>
                      <TableHead className="font-bold border-b-2 border-black">
                        PRIMERO
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      resultado.primeros as Map<string, string[]>
                    ).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="border-b border-black">
                          {key}
                        </TableCell>
                        <TableCell className="border-b border-black">
                          {"{ "}
                          {Array.from(value).join(", ")}
                          {" }"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold border-b-2 border-black">
                        No Terminal
                      </TableHead>
                      <TableHead className="font-bold border-b-2 border-black">
                        SIGUIENTE
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      resultado.siguientes as Map<string, string[]>
                    ).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="border-b border-black">
                          {key}
                        </TableCell>
                        <TableCell className="border-b border-black">
                          {"{ "}
                          {Array.from(value).join(", ")}
                          {" }"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-black">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-semibold">
                  Tabla M
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold border-b-2 border-black"></TableHead>
                        {Array.from(resultado.simbolos_t as Set<string>).map(
                          (terminal) => (
                            <TableHead
                              key={terminal}
                              className="font-bold border-b-2 border-black"
                            >
                              {terminal}
                            </TableHead>
                          )
                        )}
                        <TableHead className="font-bold border-b-2 border-black">
                          $
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(resultado.M).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium border-b border-black">
                            {key}
                          </TableCell>
                          {Object.entries(
                            value as { [key: string]: string }
                          ).map(([subkey, value]) => (
                            <TableCell
                              key={subkey}
                              className="border-b border-black"
                            >
                              {value ? `${key}->${value}` : ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-black">
              <CardHeader className="bg-black text-white flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Análisis de Cadenas</CardTitle>
                <Button
                  className={`rounded-full ${getStatusColor()} w-8 h-8 flex items-center justify-center`}
                >
                  <Circle size={18} />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Input
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Ingrese la cadena a analizar"
                    className="w-full p-3 border-2 border-black rounded-none"
                  />
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-none flex items-center justify-center space-x-2"
                    onClick={processReconocimiento}
                  >
                    <Play size={18} />
                    <span>Analizar Cadena</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>


          {reconocimiento && (
            <div>
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">
                    Tabla de Reconocimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold border-b-2 border-black">
                            Pila
                          </TableHead>
                          <TableHead className="font-bold border-b-2 border-black">
                            Entrada
                          </TableHead>
                          <TableHead className="font-bold border-b-2 border-black">
                            Salida
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconocimiento.tabla.map((entry: {pila: string, entrada: string, salida: string}, index: number) => <TableRow key={index}>
                          <TableCell>{entry.pila}</TableCell>
                          <TableCell>{entry.entrada}</TableCell>
                          <TableCell>{entry.salida}</TableCell>
                        </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}