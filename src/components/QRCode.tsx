import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

interface QRCodeProps {
  url: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ url }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
      <QRCodeSVG value={url} size={200} />
      <p className="mt-4 text-sm text-gray-600">Escanee para sacar turno</p>
    </div>
  );
};

export default QRCodeComponent;
