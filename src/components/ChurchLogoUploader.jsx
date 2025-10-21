import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadChurchLogo, deleteChurchLogo } from '../lib/supabaseService';

const ChurchLogoUploader = ({ currentLogoUrl, onLogoChange }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentLogoUrl);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            setError('Tipo de arquivo inválido. Use PNG, JPG, WEBP ou SVG.');
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5242880) {
            setError('Arquivo muito grande. Tamanho máximo: 5MB');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Criar preview local
            const localPreview = URL.createObjectURL(file);
            setPreviewUrl(localPreview);

            // Fazer upload
            const newLogoUrl = await uploadChurchLogo(file);
            
            // Atualizar preview com URL real
            setPreviewUrl(newLogoUrl);
            
            // Notificar componente pai
            if (onLogoChange) {
                onLogoChange(newLogoUrl);
            }

            alert('Logo atualizada com sucesso!');
        } catch (err) {
            console.error('Erro ao fazer upload:', err);
            setError('Erro ao fazer upload. Tente novamente.');
            setPreviewUrl(currentLogoUrl);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Logo da Igreja
            </h3>

            {/* Preview da Logo */}
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Logo da Igreja"
                        className="max-w-[200px] max-h-[200px] object-contain"
                    />
                ) : (
                    <div className="text-center">
                        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nenhuma logo configurada
                        </p>
                    </div>
                )}
            </div>

            {/* Botão de Upload */}
            <div className="flex gap-3">
                <label className="flex-1">
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                    />
                    <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        uploading
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                        <Upload className="w-5 h-5" />
                        <span>{uploading ? 'Enviando...' : 'Escolher Nova Logo'}</span>
                    </div>
                </label>
            </div>

            {/* Mensagem de Erro */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Informações */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Formatos aceitos: PNG, JPG, WEBP, SVG</p>
                <p>• Tamanho máximo: 5MB</p>
                <p>• Recomendado: imagem quadrada ou com fundo transparente</p>
            </div>
        </div>
    );
};

export default ChurchLogoUploader;
