# LeadConverter para MEIs - Instruções para Copilot

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Sobre o Projeto

Este é um CRM (Customer Relationship Management) desenvolvido especificamente para MEIs (Microempreendedores Individuais) usando Next.js, TypeScript, Tailwind CSS e Firebase.

## Tecnologias Utilizadas

- **Frontend**: Next.js 15 com TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Autenticação**: Firebase Auth com aprovação manual
- **Banco de Dados**: Firestore
- **Armazenamento**: Firebase Storage

## Funcionalidades Principais

1. **Cadastro de Clientes**: Nome, telefone, e-mail, CNPJ/CPF, segmento, observações
2. **Histórico de Interações**: Registro de chamadas, reuniões, mensagens, arquivos
3. **Funil de Vendas**: Drag & drop com etapas personalizáveis
4. **Agenda de Tarefas**: Lembretes e follow-ups
5. **Geração de Orçamentos**: Templates editáveis
6. **Integração WhatsApp**: Envio direto de mensagens
7. **Relatórios Básicos**: Métricas e conversões

## Regras de Negócio

- **SaaS Multi-tenant**: Cada usuário vê apenas seus próprios dados
- **Aprovação Manual**: Novos cadastros precisam ser aprovados
- **Isolamento de Dados**: Firestore rules garantem separação por usuário
- **Interface Simples**: Foco na usabilidade para MEIs

## Padrões de Código

- Use TypeScript para type safety
- Componentes funcionais com hooks
- Tailwind CSS para estilos
- Firebase SDK v9+ (modular)
- Validação com Zod
- Formulários com React Hook Form

## Estrutura de Pastas

```
src/
├── app/              # App Router (Next.js 13+)
├── components/       # Componentes reutilizáveis
├── lib/             # Configurações e utilities
├── types/           # Definições de tipos TypeScript
├── hooks/           # Custom hooks
└── utils/           # Funções utilitárias
```
