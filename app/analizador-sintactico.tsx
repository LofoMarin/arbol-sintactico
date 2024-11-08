'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, ChevronRight, Play } from 'lucide-react'

export default function AnalizadorSintacticoMinimalista() {
  const [grammar, setGrammar] = useState('')
  const [inputString, setInputString] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setGrammar(content)
      }
      reader.readAsText(file)
    }
  }

  const processGrammar = () => {
    setShowResults(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <motion.div 
      className="container mx-auto p-8 space-y-8 bg-white min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold">Analizador Sintáctico</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="grammar-file" className="block text-sm font-medium text-black mb-2">
                  Cargar archivo de gramática
                </label>
                <div className="flex items-center space-x-4">
                  <Input id="grammar-file" type="file" onChange={handleFileUpload} accept=".txt" className="hidden" />
                  <Button 
                    onClick={() => document.getElementById('grammar-file')?.click()}
                    className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800"
                  >
                    <Upload size={18} />
                    <span>Subir archivo</span>
                  </Button>
                  <span className="text-sm text-gray-600">{grammar ? 'Archivo cargado' : 'Ningún archivo seleccionado'}</span>
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
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <>
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">Gramática Procesada</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea value={grammar} rows={5} readOnly className="w-full p-3 border-2 border-black rounded-none" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">Conjuntos PRIMERO y SIGUIENTE</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold border-b-2 border-black">No Terminal</TableHead>
                        <TableHead className="font-bold border-b-2 border-black">PRIMERO</TableHead>
                        <TableHead className="font-bold border-b-2 border-black">SIGUIENTE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="border-b border-black">E</TableCell>
                        <TableCell className="border-b border-black">{'{a, b}'}</TableCell>
                        <TableCell className="border-b border-black">{'{$}'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border-b border-black">T</TableCell>
                        <TableCell className="border-b border-black">{'{a, b}'}</TableCell>
                        <TableCell className="border-b border-black">{'{a, b, $}'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">Tabla M</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold border-b-2 border-black"></TableHead>
                          <TableHead className="font-bold border-b-2 border-black">a</TableHead>
                          <TableHead className="font-bold border-b-2 border-black">b</TableHead>
                          <TableHead className="font-bold border-b-2 border-black">$</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium border-b border-black">E</TableCell>
                          <TableCell className="border-b border-black">E → TE'</TableCell>
                          <TableCell className="border-b border-black">E → TE'</TableCell>
                          <TableCell className="border-b border-black"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium border-b border-black">T</TableCell>
                          <TableCell className="border-b border-black">T → FT'</TableCell>
                          <TableCell className="border-b border-black">T → FT'</TableCell>
                          <TableCell className="border-b border-black"></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">Análisis de Cadenas</CardTitle>
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
                    >
                      <Play size={18} />
                      <span>Analizar Cadena</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="border-2 border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-2xl font-semibold">Tabla de Reconocimiento</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold border-b-2 border-black">Pila</TableHead>
                          <TableHead className="font-bold border-b-2 border-black">Entrada</TableHead>
                          <TableHead className="font-bold border-b-2 border-black">Salida</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="border-b border-black">$E</TableCell>
                          <TableCell className="border-b border-black">ab$</TableCell>
                          <TableCell className="border-b border-black"></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-b border-black">$E'T</TableCell>
                          <TableCell className="border-b border-black">ab$</TableCell>
                          <TableCell className="border-b border-black">E → TE'</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="border-b border-black">$E'T'F</TableCell>
                          <TableCell className="border-b border-black">ab$</TableCell>
                          <TableCell className="border-b border-black">T → FT'</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}