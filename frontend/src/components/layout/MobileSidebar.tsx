import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Sidebar } from './Sidebar';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onClose }) => (
  <Transition.Root show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="transition-opacity ease-linear duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-slate-900/40" />
      </Transition.Child>

      <div className="fixed inset-0 z-50 flex">
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-200 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-200 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel className="relative flex w-64 max-w-xs flex-1 flex-col bg-white pb-6 shadow-xl">
            <div className="flex items-center justify-between px-4 py-5">
              <div className="text-lg font-semibold text-primary-600">StudioFit</div>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <Sidebar mobile onNavigate={onClose} />
          </Dialog.Panel>
        </Transition.Child>
        <div className="w-16 flex-shrink-0" aria-hidden="true" />
      </div>
    </Dialog>
  </Transition.Root>
);
