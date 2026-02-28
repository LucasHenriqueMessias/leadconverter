'use client';

import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  clientName: string;
  onSendMessage?: (message: string) => Promise<void>;
}

export const WhatsAppButton = ({ phoneNumber, clientName, onSendMessage }: WhatsAppButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Templates de mensagem
  const templates = [
    {
      id: 'greeting',
      name: 'Saudação',
      text: `Olá ${clientName}! Tudo bem? Sou da equipe e gostaria de conversar com você.`
    },
    {
      id: 'follow-up',
      name: 'Follow-up',
      text: `Oi ${clientName}! Estou entrando em contato para dar continuidade à nossa conversa. Você tem um momento?`
    },
    {
      id: 'proposal',
      name: 'Proposta',
      text: `Olá ${clientName}! Preparei uma proposta personalizada para você. Podemos conversar sobre ela?`
    },
    {
      id: 'meeting',
      name: 'Reunião',
      text: `Oi ${clientName}! Gostaria de agendar uma reunião para conversarmos melhor. Qual seria um bom horário para você?`
    }
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(message);
      } else {
        // Fallback: abrir WhatsApp Web
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
      }
      setMessage('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUseTemplate = (templateText: string) => {
    setMessage(templateText);
  };

  return (
    <>
      {/* Botão WhatsApp */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        title="Enviar mensagem WhatsApp"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        WhatsApp
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Enviar mensagem WhatsApp
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Para: {clientName} ({phoneNumber})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Templates rápidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleUseTemplate(template.text)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite sua mensagem..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} caracteres
                </p>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
