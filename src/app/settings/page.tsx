import PageHeading from '@/components/pageHeading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Account from './components/Account';
import Profile from './components/Profile';

const SettingsPage = () => {
  return (
    <div className='mx-auto pb-16'>
      <PageHeading heading='Settings' />

      <Tabs defaultValue='profile'>
        <div className='mt-6 flex flex-col justify-center items-center'>
          <TabsList className='font-josefin_Sans'>
            <TabsTrigger className='text-xl' value='profile'>
              <p className='font-josefin_Sans text-base sm:text-xl'>Profile</p>
              <div className='h-[2px] w-1 bg-primary-monkeyOrange group-hover:w-full group-data-[state=active]:w-full transition-all rounded-full' />
            </TabsTrigger>

            <TabsTrigger className='text-xl' value='account'>
              <p className='font-josefin_Sans text-base sm:text-xl'>Account</p>

              <div className='h-[2px] w-1 bg-primary-monkeyOrange group-hover:w-full group-data-[state=active]:w-full transition-all rounded-full' />
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='mx-auto w-full md:w-4/5'>
          <TabsContent className='w-full' value='profile'>
            <Profile />
          </TabsContent>

          <TabsContent className='w-full' value='account'>
            <Account />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
