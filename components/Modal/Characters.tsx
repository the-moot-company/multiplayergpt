import Modal from '@/components/Modal/Modal';

const Characters = [
  {
    name: 'Serial killer',
    description: 'A serial killer who is being interviewed by the police',
  },
  {
    name: 'Travel advisor',
    description: 'A travel advisor who is helping a customer book a flight',
  },
  {
    name: 'Standup comedian',
    description: 'A standup comedian who is performing at a comedy club',
  },
  {
    name: 'Senior software developer',
    description:
      'A senior software developer who is knowledgable about anything software related',
  },
  {
    name: 'Ramen profitable indie hacker',
    description:
      'An indie entrepreneur who has built a wildly profitable bootstrap business',
  },
];

const CharactersModal = ({ isCharactersModalOpen, closeCharactersModal }) => {
  return (
    <Modal
      isDisplayed={isCharactersModalOpen}
      onClose={closeCharactersModal}
      displayCloseButton={false}
    >
      <div className="flex flex-col w-full">
        <h3 className="mb-1 text-lg font-medium">Select an AI character</h3>
        <p className="text-sm opacity-60 mb-4">
          Characters help target your conversations
        </p>
        <div className="grid grid-cols-2 gap-6 w-full">
          {Characters.map((character) => (
            <div
              key={character.name}
              className="flex flex-col items-center justify-center rounded-md border border-base-300 bg-base-200 p-3"
            >
              <h4 className="text-lg font-medium">{character.name}</h4>
              <p className="text-sm opacity-60">{character.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={closeCharactersModal}
            className="btn-sm btn rounded border border-base-300 bg-base-200 capitalize shadow-sm text-neutral hover:border-primary-green hover:bg-primary-green hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CharactersModal;
