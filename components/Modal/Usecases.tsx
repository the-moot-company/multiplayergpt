import { useState } from 'react';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineChat,
  HiOutlineChatAlt2,
  HiOutlineCode,
  HiOutlineCube,
  HiOutlineFire,
  HiOutlinePencilAlt,
  HiOutlineSparkles,
  HiOutlineTranslate,
  HiOutlineUser,
} from 'react-icons/hi';

import Modal from '@/components/Modal/Modal';

const Usecases = [
  {
    name: 'Pair Programming',
    description:
      'Working together with another developer to troubleshoot, mentor or build.',
    icon: <HiOutlineCode />,
  },

  {
    name: 'Group Brainstorm',
    description:
      'Brainstorm with your team, friends or family and leverage a GPT group chat to get creative together.',
    icon: <HiOutlineSparkles />,
  },

  {
    name: 'Group therapy',
    description:
      'Use multiplayerGPT as a mediator between you and others, without needing another person to be involved.',
    icon: <HiOutlineChatAlt2 />,
  },

  {
    name: 'Play around',
    description:
      'Play around with our Character presets and explore the depths of GPT together.',
    icon: <HiOutlineFire />,
  },

  {
    name: 'Language Learning',
    description:
      'Practice conversational skills in different languages with other learners and let the AI assist in correcting and teaching.',
    icon: <HiOutlineTranslate />,
  },

  {
    name: 'Book Club Discussions',
    description:
      'Discuss and analyze books with fellow readers, while GPT offers insights, clarifications, or generates discussion prompts.',
    icon: <HiOutlineBookOpen />,
  },

  {
    name: 'Roleplaying Games',
    description:
      'Engage in collaborative storytelling or play tabletop RPGs with the assistance of GPT as a narrator, game master, or character.',
    icon: <HiOutlineCube />,
  },

  {
    name: 'Debate Club',
    description:
      'Engage in lively debates with other users, while GPT provides factual information, counterarguments, or suggests new topics.',
    icon: <HiOutlineChat />,
  },

  {
    name: 'Creative Writing Collaboration',
    description:
      'Work with other writers to create stories, poems, or scripts, and get suggestions or inspiration from GPT.',
    icon: <HiOutlinePencilAlt />,
  },

  {
    name: 'Study Groups',
    description:
      'Form study groups to learn and discuss various subjects, with GPT providing explanations, examples, or quiz questions.',
    icon: <HiOutlineAcademicCap />,
  },

  {
    name: 'Business Collaboration',
    description:
      'Collaborate with colleagues on projects, proposals, or presentations, while GPT helps with research, ideas, or editing.',
    icon: <HiOutlineBriefcase />,
  },
];

const UsecasesModal = ({ isUsecasesModalOpen, closeUsecasesModal }) => {
  return (
    <Modal
      isDisplayed={isUsecasesModalOpen}
      onClose={closeUsecasesModal}
      displayCloseButton={false}
    >
      <div className="flex flex-col w-full overflow-y-scroll h-96 p-8">
        <h3 className="mb-1 text-lg font-medium text-left">Usecases</h3>
        <p className="text-sm opacity-60 mb-4">How to use MultiplayerGPT</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-12">
          {Usecases.map((usecase) => (
            <div
              key={usecase.name}
              className="cursor-pointer flex flex-col p-4 items-center justify-start rounded-md border-2"
            >
              <div className="flex flex-row items-center justify-start w-full">
                {usecase.icon}
                <h4 className="text-lg font-medium text-left w-full ml-2">
                  {usecase.name}
                </h4>
              </div>
              <p className="text-sm opacity-60 text-left">
                {usecase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-row justify-end absolute w-full bg-base-100 left-0 bottom-0 rounded-b-xl p-4 pr-4">
        <button
          onClick={closeUsecasesModal}
          className="px-2 py-1 cursor-pointer rounded border border-base-300 bg-base-200 capitalize shadow-sm text-neutral hover:bg-base-300"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default UsecasesModal;
