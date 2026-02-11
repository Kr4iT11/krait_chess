// import { useAuth } from '../../context/auth/AuthContext';

import Button from "../../components/ui/Button";
import PlayChess from "../play/playchess";

const Dashboard = () => {


    return (
        <>
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* LEFT CARD – Play Button */}
                <div className="col-span-12 xl:col-span-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex items-center justify-start w-12 h-12 bg-yellow-100 rounded-xl">
                        </div>

                        <div className="mt-5">
                            <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                                Start a Game
                            </h4>

                            <Button
                                type="submit"
                                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                                Play Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT CARD – Chess UI */}
                <PlayChess />
            </div>
        </>
    );
};

export default Dashboard;