'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { IoKeyOutline } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa6';
import { MdOutlineCameraswitch } from 'react-icons/md';
import Image from 'next/image';
import { useSwapBoostKey } from '@/hooks/useSwapBoostKey';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SwapBoostKeyModal() {
  const { open, activeTab, setActiveTab, setOpen, openModal } = useSwapBoostKey();

  const swapPackage = [
    {
      title: 'Sign Swap',
      amount: 40,
      price: 1.99,
      currency: '$',
    },
    {
      title: 'Boost Swap',
      amount: 120,
      price: 4.99,
      currency: '$',
    },
    {
      title: 'Prime Swap',
      amount: 300,
      price: 9.99,
      currency: '$',
    },
    {
      title: 'Sign Swap',
      amount: 40,
      price: 1.99,
      currency: '$',
    },
    {
      title: 'Boost Swap',
      amount: 120,
      price: 4.99,
      currency: '$',
    },
    {
      title: 'Prime Swap',
      amount: 300,
      price: 9.99,
      currency: '$',
    },
    {
      title: 'Sign Swap',
      amount: 40,
      price: 1.99,
      currency: '$',
    },
    {
      title: 'Boost Swap',
      amount: 120,
      price: 4.99,
      currency: '$',
    },
    {
      title: 'Prime Swap',
      amount: 300,
      price: 9.99,
      currency: '$',
    },
    {
      title: 'Sign Swap',
      amount: 40,
      price: 1.99,
      currency: '$',
    },
    {
      title: 'Boost Swap',
      amount: 120,
      price: 4.99,
      currency: '$',
    },
    {
      title: 'Prime Swap',
      amount: 300,
      price: 9.99,
      currency: '$',
    },
    {
      title: 'Sign Swap',
      amount: 40,
      price: 1.99,
      currency: '$',
    },
    {
      title: 'Boost Swap',
      amount: 120,
      price: 4.99,
      currency: '$',
    },
    {
      title: 'Prime Swap',
      amount: 300,
      price: 9.99,
      currency: '$',
    },
  ];
  const boostPackage = [
    {
      title: 'Mini Boost',
      amount: 50,
      price: 2.99,
      currency: '$',
    },
    {
      title: 'Standard Boost',
      amount: 150,
      price: 5.99,
      currency: '$',
    },
    {
      title: 'Mega Boost',
      amount: 350,
      price: 11.99,
      currency: '$',
    },
    {
      title: 'Ultra Boost',
      amount: 700,
      price: 21.99,
      currency: '$',
    },
    {
      title: 'Mini Boost',
      amount: 50,
      price: 2.99,
      currency: '$',
    },
    {
      title: 'Standard Boost',
      amount: 150,
      price: 5.99,
      currency: '$',
    },
  ];

  const keyPackage = [
    {
      title: 'Bronze Key',
      amount: 1,
      price: 0.99,
      currency: '$',
    },
    {
      title: 'Silver Key',
      amount: 5,
      price: 4.49,
      currency: '$',
    },
    {
      title: 'Gold Key',
      amount: 12,
      price: 9.99,
      currency: '$',
    },
    {
      title: 'Platinum Key',
      amount: 25,
      price: 19.99,
      currency: '$',
    },

    {
      title: 'Platinum Key',
      amount: 25,
      price: 19.99,
      currency: '$',
    },
    {
      title: 'Bronze Key',
      amount: 1,
      price: 0.99,
      currency: '$',
    },
    {
      title: 'Silver Key',
      amount: 5,
      price: 4.49,
      currency: '$',
    },
  ];

  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => openModal('swap')}
          className="text-primary bg-primary/10 flex items-center justify-center gap-3 rounded-sm p-2"
        >
          <span className="flex items-center gap-2">
            <span>
              <MdOutlineCameraswitch className="size-5 rotate-90" />
            </span>{' '}
            0
          </span>
          <span className="bg-primary text-primary-foreground rounded p-1">
            <FaPlus />
          </span>
        </button>

        <button
          onClick={() => openModal('boost')}
          className="text-primary bg-primary/10 flex items-center justify-center gap-3 rounded-sm p-2"
        >
          <span className="flex items-center gap-2">
            <IoKeyOutline className="size-5" /> 0
          </span>
          <span className="bg-primary text-primary-foreground rounded p-1">
            <FaPlus />
          </span>
        </button>
        <button
          onClick={() => openModal('key')}
          className="text-primary bg-primary/10 flex items-center justify-center gap-3 rounded-sm p-2"
        >
          <span className="flex items-center gap-2">
            <AiOutlineThunderbolt className="size-5" /> 0
          </span>
          <span className="bg-primary text-primary-foreground rounded p-1">
            <FaPlus />
          </span>
        </button>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border flex max-h-[95vh] max-w-[95vw] flex-col overflow-hidden border-2 max-sm:p-3 sm:max-h-[80vh] sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold capitalize">
              {activeTab} Packages
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value: any) => setActiveTab(value)}
            className="h-full"
          >
            <TabsList className="text-foreground bg-surface-secondary h-auto w-full">
              <TabsTrigger
                value="swap"
                className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2"
              >
                <MdOutlineCameraswitch className="rotate-90" /> Swap
              </TabsTrigger>
              <TabsTrigger
                value="boost"
                className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2"
              >
                <IoKeyOutline /> Boost
              </TabsTrigger>
              <TabsTrigger
                value="key"
                className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2"
              >
                <AiOutlineThunderbolt /> Key
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swap" className="grid h-full grid-cols-1 gap-5 py-5 lg:grid-cols-4">
              <div className="hidden flex-col items-center justify-center gap-3 lg:flex">
                <Image
                  alt=""
                  src="/images/swap-img.png"
                  width={100}
                  height={100}
                  className="h-auto w-[70%]"
                />
                <p className="text-center text-lg font-medium">The Science of Swapping</p>
              </div>

              <div className="h-[78.5vh] scrollbar-thin overflow-y-auto sm:h-[61.5vh] lg:col-span-3">
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                  {swapPackage.map((swap, index) => (
                    <div
                      key={index}
                      className="border-border bg-surface-secondary flex flex-col items-center justify-center gap-3 rounded-md border p-5"
                    >
                      <h1>{swap.title}</h1>
                      <p>{swap.amount} Swap</p>
                      <button className="text-primary-foreground bg-primary rounded-sm px-5 py-2">
                        {swap.price} {swap.currency}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="boost"
              className="grid h-full grid-cols-1 gap-5 py-5 lg:grid-cols-4"
            >
              <div className="hidden flex-col items-center justify-center gap-3 lg:flex">
                <Image
                  alt=""
                  src="/images/boost-img.png"
                  width={100}
                  height={100}
                  className="h-auto w-[70%]"
                />
                <p className="text-center text-lg font-medium">Skip a voting session</p>
              </div>

              <div className="h-[78.5vh] scrollbar-thin overflow-y-auto sm:h-[61.5vh] lg:col-span-3">
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                  {boostPackage.map((boost, index) => (
                    <div
                      key={index}
                      className="border-border bg-surface-secondary flex flex-col items-center justify-center gap-3 rounded-md border p-5"
                    >
                      <h1>{boost.title}</h1>
                      <p>{boost.amount} Boost</p>
                      <button className="text-primary-foreground bg-primary rounded-sm px-5 py-2">
                        {boost.price} {boost.currency}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="key" className="grid h-full grid-cols-1 gap-5 py-5 lg:grid-cols-4">
              <div className="hidden flex-col items-center justify-center gap-3 lg:flex">
                <Image
                  alt=""
                  src="/images/key-img.png"
                  width={100}
                  height={100}
                  className="h-auto w-[70%]"
                />
                <p className="text-center text-lg font-medium">Unlock Boosts Early</p>
              </div>

              <div className="h-[78.5vh] scrollbar-thin overflow-y-auto sm:h-[61.5vh] lg:col-span-3">
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                  {keyPackage.map((key, index) => (
                    <div
                      key={index}
                      className="border-border bg-surface-secondary flex flex-col items-center justify-center gap-3 rounded-md border p-5"
                    >
                      <h1>{key.title}</h1>
                      <p>{key.amount} Key</p>
                      <button className="text-primary-foreground bg-primary rounded-sm px-5 py-2">
                        {key.price} {key.currency}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
