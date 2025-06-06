import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, imageTitle }: ImageModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative max-w-5xl w-full bg-black rounded-lg overflow-hidden">
                        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 cursor-pointer"
        >
                  <FiX size={24} />
                </button>
                
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={imageUrl}
                    alt={imageTitle || 'Image preview'}
                    className="object-contain"
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    priority
                    quality={100}
                  />
                </div>
                
                {imageTitle && (
                  <Dialog.Title className="absolute bottom-4 left-0 right-0 text-white text-center bg-black/50 py-2">
                    {imageTitle}
                  </Dialog.Title>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 