import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getParceirosExternos, adicionarParceiroExterno, atualizarParceiroExterno, removerParceiroExterno } from '@/services/oportunidades.service';
import { ParceiroExterno } from '@/integrations/supabase/types';

const Partners = () => {
  const [parceiros, setParceiros] = useState<ParceiroExterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParceiroId, setEditingParceiroId] = useState<number | null>(null);
  
  // Estados para o formulário
  const [nomeParceiro, setNomeParceiro] = useState('');
  const [emailParceiro, setEmailParceiro] = useState('');
  const [telefoneParceiro, setTelefoneParceiro] = useState('');
  const [observacoesParceiro, setObservacoesParceiro] = useState('');
  
  // Carregar parceiros
  useEffect(() => {
    const fetchParceiros = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getParceirosExternos();
        setParceiros(data);
        
      } catch (err) {
        console.error('Erro ao carregar parceiros:', err);
        setError('Falha ao carregar parceiros. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParceiros();
  }, []);
  
  // Filtrar parceiros pelo termo de busca
  const filteredParceiros = parceiros.filter(parceiro => 
    parceiro.nome_parceiro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (parceiro.email_parceiro && parceiro.email_parceiro.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (parceiro.telefone_parceiro && parceiro.telefone_parceiro.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Iniciar edição de parceiro
  const handleEditParceiro = (parceiro: ParceiroExterno) => {
    setEditingParceiroId(parceiro.id_parceiro_externo);
    setNomeParceiro(parceiro.nome_parceiro);
    setEmailParceiro(parceiro.email_parceiro || '');
    setTelefoneParceiro(parceiro.telefone_parceiro || '');
    setObservacoesParceiro(parceiro.observacoes || '');
    setShowAddForm(true);
  };
  
  // Iniciar adição de novo parceiro
  const handleAddNew = () => {
    setEditingParceiroId(null);
    setNomeParceiro('');
    setEmailParceiro('');
    setTelefoneParceiro('');
    setObservacoesParceiro('');
    setShowAddForm(true);
  };
  
  // Cancelar formulário
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingParceiroId(null);
  };
  
  // Salvar parceiro (novo ou editado)
  const handleSaveParceiro = async () => {
    if (!nomeParceiro.trim()) {
      alert('O nome do parceiro é obrigatório.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const parceiroData = {
        nome_parceiro: nomeParceiro.trim(),
        email_parceiro: emailParceiro.trim() || null,
        telefone_parceiro: telefoneParceiro.trim() || null,
        observacoes: observacoesParceiro.trim() || null
      };
      
      if (editingParceiroId) {
        // Atualizar parceiro existente
        await atualizarParceiroExterno(editingParceiroId, parceiroData);
      } else {
        // Adicionar novo parceiro
        await adicionarParceiroExterno(parceiroData);
      }
      
      // Recarregar lista de parceiros
      const data = await getParceirosExternos();
      setParceiros(data);
      
      // Limpar formulário
      setShowAddForm(false);
      setEditingParceiroId(null);
      
    } catch (err) {
      console.error('Erro ao salvar parceiro:', err);
      setError('Falha ao salvar parceiro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Remover parceiro
  const handleRemoveParceiro = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este parceiro? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await removerParceiroExterno(id);
      
      // Recarregar lista de parceiros
      const data = await getParceirosExternos();
      setParceiros(data);
      
    } catch (err) {
      console.error('Erro ao remover parceiro:', err);
      setError('Falha ao remover parceiro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && parceiros.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parceiros Externos</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Adicionar Parceiro
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-medium">Erro</h3>
          <p>{error}</p>
        </div>
      )}
      
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingParceiroId ? 'Editar Parceiro' : 'Adicionar Novo Parceiro'}</CardTitle>
            <CardDescription>
              {editingParceiroId 
                ? 'Atualize as informações do parceiro externo' 
                : 'Preencha as informações para adicionar um novo parceiro externo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="nomeParceiro">Nome do Parceiro *</Label>
                <Input
                  id="nomeParceiro"
                  value={nomeParceiro}
                  onChange={(e) => setNomeParceiro(e.target.value)}
                  placeholder="Nome da empresa parceira"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailParceiro">Email de Contato</Label>
                <Input
                  id="emailParceiro"
                  type="email"
                  value={emailParceiro}
                  onChange={(e) => setEmailParceiro(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefoneParceiro">Telefone de Contato</Label>
                <Input
                  id="telefoneParceiro"
                  value={telefoneParceiro}
                  onChange={(e) => setTelefoneParceiro(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoesParceiro">Observações</Label>
                <Input
                  id="observacoesParceiro"
                  value={observacoesParceiro}
                  onChange={(e) => setObservacoesParceiro(e.target.value)}
                  placeholder="Observações sobre o parceiro"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSaveParceiro}>
                {editingParceiroId ? 'Atualizar Parceiro' : 'Adicionar Parceiro'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Parceiros</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiros..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredParceiros.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm 
                ? 'Nenhum parceiro encontrado para a busca realizada.' 
                : 'Nenhum parceiro cadastrado. Adicione seu primeiro parceiro!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParceiros.map((parceiro) => (
                  <TableRow key={parceiro.id_parceiro_externo}>
                    <TableCell className="font-medium">{parceiro.nome_parceiro}</TableCell>
                    <TableCell>{parceiro.email_parceiro || '-'}</TableCell>
                    <TableCell>{parceiro.telefone_parceiro || '-'}</TableCell>
                    <TableCell>{parceiro.observacoes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditParceiro(parceiro)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveParceiro(parceiro.id_parceiro_externo)}
                        >
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Partners;
