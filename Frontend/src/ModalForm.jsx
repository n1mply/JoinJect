import React, { useEffect } from 'react';
import Modal from 'react-modal';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0',
    overflow: 'visible',
  },
};

export default function ModalForm({ isOpen, onClose, children }){
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      closeTimeoutMS={10}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
    {children}
    </Modal>
  );
};